import { indexLookup } from './join/lookup.js';
import { inferKeys, keyPredicate } from './util/join-keys.js';
import { parseValue } from './util/parse.js';
import { parse } from '../expression/parse.js';
import { all, not } from '../helpers/selection.js';
import { columnSet } from '../table/ColumnSet.js';
import { concat } from '../util/concat.js';
import { isArray } from '../util/is-array.js';
import { isString } from '../util/is-string.js';
import { toArray } from '../util/to-array.js';
import { toString } from '../util/to-string.js';
import { unroll } from '../util/unroll.js';

const OPT_L = { aggregate: false, window: false };
const OPT_R = { ...OPT_L, index: 1 };
const NONE = -Infinity;

export function cross(table, other, values, options) {
  return join(
    table,
    other,
    () => true,
    values,
    { ...options, left: true, right: true }
  );
}

export function join(tableL, tableR, on, values, options = {}) {
  on = inferKeys(tableL, tableR, on);
  const optParse = { join: [tableL, tableR] };
  let predicate;

  if (isArray(on)) {
    const [onL, onR] = on.map(toArray);
    predicate = keyPredicate(tableL, tableR, onL, onR);

    if (!values) {
      // infer output columns, suppress duplicated key columns
      values = inferValues(tableL, onL, onR, options);
    }
  } else {
    predicate = parse({ on }, optParse).exprs[0];

    if (!values) {
      // include all table columns if values not provided
      values = [all(), all()];
    }
  }

  return _join(
    tableL, tableR, predicate,
    parseValues(tableL, tableR, values, optParse, options && options.suffix),
    options
  );
}

function inferValues(tableL, onL, onR, options) {
  const isect = [];
  onL.forEach((s, i) => isString(s) && s === onR[i] ? isect.push(s) : 0);
  const vR = not(isect);

  if (options.left && options.right) {
    // for full join, merge shared key columns together
    const shared = new Set(isect);
    return [
      tableL.columnNames().map(s => {
        const c = `[${toString(s)}]`;
        return shared.has(s)
          ? { [s]: `(a, b) => a${c} == null ? b${c} : a${c}` }
          : s;
      }),
      vR
    ];
  }

  return options.right ? [vR, all()] : [all(), vR];
}

function parseValues(tableL, tableR, values, optParse, suffix = []) {
  if (isArray(values)) {
    let vL, vR, vJ, n = values.length;
    vL = vR = vJ = { names: [], exprs: [] };

    if (n--) {
      vL = parseValue('join', tableL, values[0], optParse);
    }
    if (n--) {
      vR = parseValue('join', tableR, values[1], OPT_R);
    }
    if (n--) {
      vJ = parse(values[2], optParse);
    }

    // handle name collisions
    const rename = new Set();
    const namesL = new Set(vL.names);
    vR.names.forEach(name => {
      if (namesL.has(name)) {
        rename.add(name);
      }
    });
    if (rename.size) {
      suffix[0] !== '' && rekey(vL.names, rename, suffix[0] || '_1');
      suffix[1] !== '' && rekey(vR.names, rename, suffix[1] || '_2');
    }

    return {
      names: vL.names.concat(vR.names, vJ.names),
      exprs: vL.exprs.concat(vR.exprs, vJ.exprs)
    };
  } else {
    return parse(values, optParse);
  }
}

function rekey(names, rename, suffix) {
  names.forEach((name, i) => rename.has(name)
    ? (names[i] = name + suffix)
    : 0);
}

function emitter(columns, getters) {
  const args = ['i', 'a', 'j', 'b'];
  return unroll(
    args,
    '{' + concat(columns, (_, i) => `_${i}.push($${i}(${args}));`) + '}',
    columns, getters
  );
}

export function _join(tableL, tableR, predicate, { names, exprs }, options = {}) {
  // initialize data for left table
  const dataL = tableL.data();
  const idxL = tableL.indices(false);
  const nL = idxL.length;
  const hitL = new Int32Array(nL);

  // initialize data for right table
  const dataR = tableR.data();
  const idxR = tableR.indices(false);
  const nR = idxR.length;
  const hitR = new Int32Array(nR);

  // initialize output data
  const ncols = names.length;
  const cols = columnSet();
  const columns = Array(ncols);
  const getters = Array(ncols);
  for (let i = 0; i < names.length; ++i) {
    columns[i] = cols.add(names[i], []);
    getters[i] = exprs[i];
  }
  const emit = emitter(columns, getters);

  // perform join
  const join = isArray(predicate) ? hashJoin : loopJoin;
  join(emit, predicate, dataL, dataR, idxL, idxR, hitL, hitR, nL, nR);

  if (options.left) {
    for (let i = 0; i < nL; ++i) {
      if (!hitL[i]) {
        emit(idxL[i], dataL, NONE, dataR);
      }
    }
  }

  if (options.right) {
    for (let j = 0; j < nR; ++j) {
      if (!hitR[j]) {
        emit(NONE, dataL, idxR[j], dataR);
      }
    }
  }

  return cols.new(tableL);
}

function loopJoin(emit, predicate, dataL, dataR, idxL, idxR, hitL, hitR, nL, nR) {
  // perform nested-loops join
  for (let i = 0; i < nL; ++i) {
    const rowL = idxL[i];
    for (let j = 0; j < nR; ++j) {
      const rowR = idxR[j];
      if (predicate(rowL, dataL, rowR, dataR)) {
        emit(rowL, dataL, rowR, dataR);
        hitL[i] = 1;
        hitR[j] = 1;
      }
    }
  }
}

function hashJoin(emit, [keyL, keyR], dataL, dataR, idxL, idxR, hitL, hitR, nL, nR) {
  // determine which table to hash
  let dataScan, keyScan, hitScan, idxScan;
  let dataHash, keyHash, hitHash, idxHash;
  let emitScan = emit;
  if (nL >= nR) {
    dataScan = dataL; keyScan = keyL; hitScan = hitL; idxScan = idxL;
    dataHash = dataR; keyHash = keyR; hitHash = hitR; idxHash = idxR;
  } else {
    dataScan = dataR; keyScan = keyR; hitScan = hitR; idxScan = idxR;
    dataHash = dataL; keyHash = keyL; hitHash = hitL; idxHash = idxL;
    emitScan = (i, a, j, b) => emit(j, b, i, a);
  }

  // build lookup table
  const lut = indexLookup(idxHash, dataHash, keyHash);

  // scan other table
  const m = idxScan.length;
  for (let j = 0; j < m; ++j) {
    const rowScan = idxScan[j];
    const list = lut.get(keyScan(rowScan, dataScan));
    if (list) {
      const n = list.length;
      for (let k = 0; k < n; ++k) {
        const i = list[k];
        emitScan(rowScan, dataScan, idxHash[i], dataHash);
        hitHash[i] = 1;
      }
      hitScan[j] = 1;
    }
  }
}

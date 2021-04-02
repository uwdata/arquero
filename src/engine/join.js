import { indexLookup } from './join/lookup';
import columnSet from '../table/column-set';
import concat from '../util/concat';
import isArray from '../util/is-array';
import unroll from '../util/unroll';

function emitter(columns, getters) {
  const args = ['i', 'a', 'j', 'b'];
  return unroll(
    args,
    '{' + concat(columns, (_, i) => `_${i}.push($${i}(${args}));`) + '}',
    columns, getters
  );
}

export default function(tableL, tableR, predicate, { names, exprs }, options = {}) {
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
        emit(idxL[i], dataL, -1, dataR);
      }
    }
  }

  if (options.right) {
    for (let j = 0; j < nR; ++j) {
      if (!hitR[j]) {
        emit(-1, dataL, idxR[j], dataR);
      }
    }
  }

  return tableL.create(cols.new());
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
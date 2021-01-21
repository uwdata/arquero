import _join from '../engine/join';
import parseKey from './expr/parse-key';
import parseValue from './expr/parse';
import { all, not } from './expr/selection';
import parse from '../expression/parse';
import error from '../util/error';
import intersect from '../util/intersect';
import isArray from '../util/is-array';
import isString from '../util/is-string';
import toArray from '../util/to-array';
import toString from '../util/to-string';

const OPT_L = { aggregate: false, window: false };
const OPT_R = { ...OPT_L, index: 1 };

export default function(tableL, tableR, on, values, options = {}) {
  on = inferKeys(tableL, tableR, on);
  const optParse = { join: [tableL, tableR] };
  let predicate;

  if (isArray(on)) {
    const [onL, onR] = on.map(toArray);
    if (onL.length !== onR.length) {
      error('Mismatched number of join keys');
    }

    predicate = [
      parseKey('join', tableL, onL),
      parseKey('join', tableR, onR)
    ];

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

export function inferKeys(tableL, tableR, on) {
  if (!on) {
    // perform natural join if join condition not provided
    const isect = intersect(tableL.columnNames(), tableR.columnNames());
    if (!isect.length) error('Natural join requires shared column names.');
    on = [isect, isect];
  } else if (isString(on)) {
    on = [on, on];
  } else if (isArray(on) && on.length === 1) {
    on = [on[0], on[0]];
  }

  return on;
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
      rekey(vL.names, rename, suffix[0] || '_1');
      rekey(vR.names, rename, suffix[1] || '_2');
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
import _join from '../engine/join';
import parseKey from './expr/parse-key';
import parseValue from './expr/parse';
import { all, not } from './expr/selection';
import parse from '../expression/parse';
import error from '../util/error';
import has from '../util/has';
import intersect from '../util/intersect';
import isArray from '../util/is-array';
import isString from '../util/is-string';
import toArray from '../util/to-array';
import toString from '../util/to-string';

const OPT_L = { aggregate: false, window: false };
const OPT_R = { ...OPT_L, index: 1 };

export default function(tableL, tableR, on, values, options = {}) {
  if (!on) {
    // perform natural join if join condition not provided
    const isect = intersect(tableL.columnNames(), tableR.columnNames());
    if (!isect.length) error('Natural join requires shared column names.');
    on = [isect, isect];
  } else if (isString(on)) {
    on = [on, on];
  } else if (isArray(on) && on.length === 1) {
    on.push(on[0]);
  }

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
      values = inferValues(tableL, tableR, onL, onR, options);
    }
  } else {
    predicate = parse({ on }, optParse).values.on;

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

function inferValues(tableL, tableR, onL, onR, options) {
  const isect = [];
  onL.forEach((s, i) => isString(s) && s === onR[i] ? isect.push(s) : 0);

  const vL = all();
  const vR = not(isect);

  if (options.left && options.right) {
    const shared = new Set(isect);
    const values = {};
    vL(tableL).forEach(s => {
      const c = `[${toString(s)}]`;
      values[s] = shared.has(s)
        ? `(a, b) => a${c} === undefined ? b${c} : a${c}`
        : `a => a${c}`;
    });
    vR(tableR).forEach(s => {
      values[s] = `(a, b) => b[${toString(s)}]`;
    });
    return values;
  }

  return options.right ? [vR, vL] : [vL, vR];
}

function parseValues(tableL, tableR, values, optParse, suffix = []) {
  if (isArray(values)) {
    let vL, vR, vJ, n = values.length;

    if (n--) {
      vL = parseValue('join', tableL, values[0], OPT_L).values;
    }
    if (n--) {
      vR = parseValue('join', tableR, values[1], OPT_R).values;
    }
    if (n--) {
      vJ = parse(values[2], optParse).values;
    }

    // handle name collisions
    const rename = new Set();
    for (const name in vR) {
      if (has(vL, name)) {
        rename.add(name);
      }
    }
    if (rename.size) {
      vL = rekey(vL, rename, suffix[0] || '_1');
      vR = rekey(vR, rename, suffix[1] || '_2');
    }

    return { values: { ...vL, ...vR, ...vJ } };
  } else {
    return parse(values, optParse);
  }
}

function rekey(values, names, suffix) {
  const object = {};
  for (const name in values) {
    const key = name + (names.has(name) ? suffix : '');
    object[key] = values[name];
  }
  return object;
}
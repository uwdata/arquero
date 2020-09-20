import _join_loop from '../engine/join-loop';
import _join_hash from '../engine/join-hash';
import parseKey from './expr/parse-key';
import parseValue from './expr/parse';
import { all } from './expr/selection';
import parse from '../expression/parse';
import has from '../util/has';
import intersect from '../util/intersect';
import isArray from '../util/is-array';

const OPT_L = { aggregate: false, window: false };
const OPT_R = { ...OPT_L, index: 1 };

export default function(tableL, tableR, on, values, options) {
  if (!on) {
    // perform natural join if join condition not provided
    const isect = intersect(tableL.columnNames(), tableR.columnNames());
    on = [isect, isect];
  }

  if (!values) {
    // include all table columns if values not provided
    values = [all(), all()];
  }

  const optParse = { join: [tableL, tableR] };

  const join = isArray(on)
    ? (on = [
        parseKey('join', tableL, on[0]),
        parseKey('join', tableR, on[1])
      ], _join_hash)
    : (on = parse({ on }, optParse).values.on, _join_loop);

  return join(
    tableL, tableR, on,
    parseValues(tableL, tableR, values, optParse, options && options.suffix),
    options
  );
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
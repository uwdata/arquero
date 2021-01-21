import _join_filter from '../engine/join-filter';
import parse from '../expression/parse';
import { inferKeys } from './join';
import parseKey from './util/parse-key';
import isArray from '../util/is-array';

export default function(tableL, tableR, on, options) {
  on = inferKeys(tableL, tableR, on);
  on = isArray(on)
    ? toPredicate(
        parseKey('join', tableL, on[0]),
        parseKey('join', tableR, on[1])
      )
    : parse({ on }, { join: [tableL, tableR] }).exprs[0];

  return _join_filter(tableL, tableR, on, options);
}

function toPredicate(keyL, keyR) {
  return (rowL, dataL, rowR, dataR) => {
    const kl = keyL(rowL, dataL);
    const kr = keyR(rowR, dataR);
    return kl === kr && kl != null && kr != null;
  };
}
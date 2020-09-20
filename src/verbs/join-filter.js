import _join_filter from '../engine/join-filter';
import parseKey from './expr/parse-key';
import parse from '../expression/parse';
import intersect from '../util/intersect';
import isArray from '../util/is-array';

export default function(tableL, tableR, on, options) {
  if (!on) {
    // perform natural join if join condition not provided
    const isect = intersect(tableL.columnNames(), tableR.columnNames());
    on = [isect, isect];
  }

  on = isArray(on)
    ? toPredicate(
        parseKey('join', tableL, on[0]),
        parseKey('join', tableR, on[1])
      )
    : parse({ on }, { join: [tableL, tableR] }).values.on;

  return _join_filter(tableL, tableR, on, options);
}

function toPredicate(keyL, keyR) {
  return (rowL, dataL, rowR, dataR) => {
    const kl = keyL(rowL, dataL);
    const kr = keyR(rowR, dataR);
    return kl === kr && kl != null && kr != null;
  };
}
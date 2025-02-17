import { error } from '../../util/error.js';
import { intersect } from '../../util/intersect.js';
import { isArray } from '../../util/is-array.js';
import { isString } from '../../util/is-string.js';
import { parseKey } from './parse-key.js';

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

export function keyPredicate(tableL, tableR, onL, onR) {
  if (onL.length !== onR.length) {
    error('Mismatched number of join keys');
  }
  return [
    parseKey('join', tableL, onL),
    parseKey('join', tableR, onR)
  ];
}

import _join_filter from '../engine/join-filter.js';
import { inferKeys, keyPredicate } from './util/join-keys.js';
import parse from '../expression/parse.js';
import isArray from '../util/is-array.js';
import toArray from '../util/to-array.js';

export default function(tableL, tableR, on, options) {
  on = inferKeys(tableL, tableR, on);

  const predicate = isArray(on)
    ? keyPredicate(tableL, tableR, ...on.map(toArray))
    : parse({ on }, { join: [tableL, tableR] }).exprs[0];

  return _join_filter(tableL, tableR, predicate, options);
}

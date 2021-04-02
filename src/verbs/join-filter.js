import _join_filter from '../engine/join-filter';
import { inferKeys, keyPredicate } from './util/join-keys';
import parse from '../expression/parse';
import isArray from '../util/is-array';
import toArray from '../util/to-array';

export default function(tableL, tableR, on, options) {
  on = inferKeys(tableL, tableR, on);

  const predicate = isArray(on)
    ? keyPredicate(tableL, tableR, ...on.map(toArray))
    : parse({ on }, { join: [tableL, tableR] }).exprs[0];

  return _join_filter(tableL, tableR, predicate, options);
}
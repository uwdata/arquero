import _pivot from '../engine/pivot.js';
import { any } from '../op/op-api.js';
import parse from './util/parse.js';

// TODO: enforce aggregates only (no output changes) for values
export default function(table, on, values, options) {
  return _pivot(
    table,
    parse('fold', table, on),
    parse('fold', table, values, { preparse, aggronly: true }),
    options
  );
}

// map direct field reference to "any" aggregate
function preparse(map) {
  map.forEach((value, key) =>
    value.field ? map.set(key, any(value + '')) : 0
  );
}

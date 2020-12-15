import _pivot from '../engine/pivot';
import parse from './expr/parse';

// TODO: enforce aggregates only (no output changes) for values
export default function(table, on, values, options) {
  return _pivot(
    table,
    parse('fold', table, on),
    parse('fold', table, values, { preparse }),
    options
  );
}

function preparse(map) {
  // map direct field reference to "any" aggregate
  map.forEach((value, key) => value.field
    ? map.set(key, `d => any(d[${JSON.stringify(value+'')}])`)
    : 0
  );
}
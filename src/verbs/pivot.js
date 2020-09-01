import _pivot from '../engine/pivot';
import parse from './expr/parse';
import toArray from '../util/to-array';

// TODO: enforce aggregates only (no output changes) for values
export default function(table, on, values, options) {
  return _pivot(
    table,
    parse('fold', table, toArray(on)),
    parse('fold', table, toArray(values), { preparse }),
    options
  );
}

function preparse(values) {
  // map direct field reference to "any" aggregate
  for (const key in values) {
    const value = values[key];
    if (value.field) {
      values[key] = `d => any(d[${JSON.stringify(value+'')}])`;
    }
  }
}
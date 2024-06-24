import _impute from '../engine/impute.js';
import _rollup from '../engine/rollup.js';
import parse from '../expression/parse.js';
import parseValues from './util/parse.js';
import { array_agg_distinct } from '../op/op-api.js';
import error from '../util/error.js';
import toString from '../util/to-string.js';

export default function(table, values, options = {}) {
  values = parse(values, { table });

  values.names.forEach(name =>
    table.column(name) ? 0 : error(`Invalid impute column ${toString(name)}`)
  );

  if (options.expand) {
    const opt = { preparse, aggronly: true };
    const params = parseValues('impute', table, options.expand, opt);
    const result = _rollup(table.ungroup(), params);
    return _impute(
      table, values, params.names,
      params.names.map(name => result.get(name, 0))
    );
  } else {
    return _impute(table, values);
  }
}

// map direct field reference to "unique" aggregate
function preparse(map) {
  map.forEach((value, key) =>
    value.field ? map.set(key, array_agg_distinct(value + '')) : 0
  );
}

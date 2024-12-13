import { aggregateGet } from './reduce/util.js';
import { _unroll } from './unroll.js';
import { parseValue } from './util/parse.js';

export function fold(table, values, options) {
  return _fold(table, parseValue('fold', table, values), options);
}

export function _fold(table, { names = [], exprs = [], ops = [] }, options = {}) {
  if (names.length === 0) return table;

  const [k = 'key', v = 'value'] = options.as || [];
  const vals = aggregateGet(table, ops, exprs);

  return _unroll(
    table,
    {
      names: [k, v],
      exprs: [() => names, (row, data) => vals.map(fn => fn(row, data))]
    },
    { ...options, drop: names }
  );
}

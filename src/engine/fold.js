import unroll from './unroll.js';
import { aggregateGet } from './reduce/util.js';

export default function(table, { names = [], exprs = [], ops = [] }, options = {}) {
  if (names.length === 0) return table;

  const [k = 'key', v = 'value'] = options.as || [];
  const vals = aggregateGet(table, ops, exprs);

  return unroll(
    table,
    {
      names: [k, v],
      exprs: [() => names, (row, data) => vals.map(fn => fn(row, data))]
    },
    { ...options, drop: names }
  );
}

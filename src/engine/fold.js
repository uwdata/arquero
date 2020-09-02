import unroll from './unroll';
import { aggregateGet } from './reduce/util';

export default function(table, { values = {}, ops = [] }, options = {}) {
  const keys = Object.keys(values);
  const n = keys.length;
  if (n === 0) return table;

  const as = options.as || [];
  const vals = aggregateGet(table, ops, Object.values(values));
  const exprs = {
    drop: values,
    values: {
      [as[0] || 'key']: () => keys,
      [as[1] || 'value']: (row, data) => vals.map(fn => fn(row, data))
    }
  };

  return unroll(table, exprs, options);
}
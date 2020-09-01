import { aggregateGet } from './reduce/util';
import toArray from '../util/to-array';

export default function(table, { values = {}, ops = [] }, options = {}) {
  const limit = options.limit > 0 ? +options.limit : Infinity;
  const names = Object.keys(values);
  if (names.length === 0) return table;

  const get = aggregateGet(table, ops, Object.values(values));
  const data = { ...table.data() };

  names.forEach((name, index) => {
    const columns = spread(table, get[index], limit);
    const n = columns.length;
    for (let i = 0; i < n; ++i) {
      // TODO: pad index based on total count?
      // TODO: revise name to avoid conflicts?
      data[`${name}${i + 1}`] = columns[i];
    }
  });

  return table.create({ data });
}

function spread(table, get, limit) {
  const nrows = table.totalRows();
  const columns = [];

  table.scan((row, data) => {
    const values = toArray(get(row, data));
    const n = Math.min(values.length, limit);
    for (let i = 0; i < n; ++i) {
      const column = columns[i] || (columns[i] = Array(nrows).fill(null));
      column[row] = values[i];
    }
  });

  return columns;
}
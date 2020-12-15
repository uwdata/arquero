import { aggregateGet } from './reduce/util';
import columnSet from '../table/column-set';
import toArray from '../util/to-array';

export default function(table, { names, exprs, ops = [] }, options = {}) {
  const limit = options.limit > 0 ? +options.limit : Infinity;
  if (names.length === 0) return table;

  const as = (names.length === 1 && options.as) || [];
  const get = aggregateGet(table, ops, exprs);
  const cols = columnSet(table);

  names.forEach((name, index) => {
    const columns = spread(table, get[index], limit);
    const n = columns.length;
    for (let i = 0; i < n; ++i) {
      cols.add(as[i] || `${name}${i + 1}`, columns[i]);
    }
  });

  return table.create(cols);
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
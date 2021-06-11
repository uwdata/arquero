import { aggregateGet } from './reduce/util';
import columnSet from '../table/column-set';
import NULL from '../util/null';
import toArray from '../util/to-array';

export default function(table, { names, exprs, ops = [] }, options = {}) {
  if (names.length === 0) return table;

  // ignore 'as' if there are multiple field names
  const as = (names.length === 1 && options.as) || [];
  const drop = options.drop == null ? true : !!options.drop;
  const limit = options.limit == null
    ? as.length || Infinity
    : Math.max(1, +options.limit || 1);

  const get = aggregateGet(table, ops, exprs);
  const cols = columnSet();
  const map = names.reduce((map, name, i) => map.set(name, i), new Map());

  const add = (index, name) => {
    const columns = spread(table, get[index], limit);
    const n = columns.length;
    for (let i = 0; i < n; ++i) {
      cols.add(as[i] || `${name}_${i + 1}`, columns[i]);
    }
  };

  table.columnNames().forEach(name => {
    if (map.has(name)) {
      if (!drop) cols.add(name, table.column(name));
      add(map.get(name), name);
      map.delete(name);
    } else {
      cols.add(name, table.column(name));
    }
  });

  map.forEach(add);

  return table.create(cols);
}

function spread(table, get, limit) {
  const nrows = table.totalRows();
  const columns = [];

  table.scan((row, data) => {
    const values = toArray(get(row, data));
    const n = Math.min(values.length, limit);
    while (columns.length < n) {
      columns.push(Array(nrows).fill(NULL));
    }
    for (let i = 0; i < n; ++i) {
      columns[i][row] = values[i];
    }
  });

  return columns;
}
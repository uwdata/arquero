import { aggregateGet } from './reduce/util.js';
import { parseValue } from './util/parse.js';
import { columnSet } from '../table/ColumnSet.js';
import { NULL } from '../util/null.js';
import { toArray } from '../util/to-array.js';

export function spread(table, values, options) {
  return _spread(table, parseValue('spread', table, values), options);
}

export function _spread(table, { names, exprs, ops = [] }, options = {}) {
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
    const columns = spreadCols(table, get[index], limit);
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

  return cols.derive(table);
}

function spreadCols(table, get, limit) {
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

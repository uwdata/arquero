import { aggregateGet } from './reduce/util';
import keyFunction from '../util/key-function';

export default function(table, exprs) {
  return table.create({
    groups: createGroups(table, exprs)
  });
}

function createGroups(table, { names = [], exprs = [], ops = [] }) {
  const n = names.length;
  if (n === 0) return null;

  // check for optimized path when grouping by a single field
  // use pre-calculated groups if available
  if (n === 1 && !table.isFiltered() && exprs[0].field) {
    const col = table.column(exprs[0].field);
    if (col.groups) return col.groups(names);
  }

  let get = aggregateGet(table, ops, exprs);
  const getKey = keyFunction(get);
  const keys = new Uint32Array(table.totalRows());
  const index = {};
  const rows = [];

  table.scan((row, data) => {
    const key = getKey(row, data) + '';
    const val = index[key];
    keys[row] = val != null ? val : (index[key] = rows.push(row) - 1);
  });

  if (!ops.length) {
    // capture data in closure, so no interaction with select
    const data = table.data();
    get = get.map(f => row => f(row, data));
  }

  return { keys, get, names, rows, size: rows.length };
}
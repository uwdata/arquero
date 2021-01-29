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
  const nrows = table.totalRows();
  const keys = new Uint32Array(nrows);
  const index = {};
  const rows = [];

  // inline table scan for performance
  const data = table.data();
  const bits = table.mask();
  if (bits) {
    for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
      const key = getKey(i, data) + '';
      const val = index[key];
      keys[i] = val != null ? val : (index[key] = rows.push(i) - 1);
    }
  } else {
    for (let i = 0; i < nrows; ++i) {
      const key = getKey(i, data) + '';
      const val = index[key];
      keys[i] = val != null ? val : (index[key] = rows.push(i) - 1);
    }
  }

  if (!ops.length) {
    // capture data in closure, so no interaction with select
    get = get.map(f => row => f(row, data));
  }

  return { keys, get, names, rows, size: rows.length };
}
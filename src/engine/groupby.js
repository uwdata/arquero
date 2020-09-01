import { aggregateGet } from './reduce/util';
import keyFunction from '../util/key-function';

export default function(table, exprs) {
  return table.create({
    groups: createGroups(table, exprs)
  });
}

function createGroups(table, { values = {}, ops = [] }) {
  const data = table.data();
  const names = Object.keys(values);
  if (names.length === 0) return null;

  let get = aggregateGet(table, ops, Object.values(values));
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
    get = get.map(f => row => f(row, data));
  }

  return { keys, get, names, rows, size: rows.length };
}
import { filter } from './filter.js';
import { slice as _slice } from '../helpers/slice.js';

export function slice(table, start = 0, end = Infinity) {
  if (table.isGrouped()) {
    return filter(table, _slice(start, end)).reify();
  }

  // if not grouped, scan table directly
  const indices = [];
  const nrows = table.numRows();
  start = Math.max(0, start + (start < 0 ? nrows : 0));
  end = Math.min(nrows, Math.max(0, end + (end < 0 ? nrows : 0)));
  table.scan(row => indices.push(row), true, end - start, start);
  return table.reify(indices);
}

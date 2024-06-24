import _select from '../engine/select.js';
import resolve from '../helpers/selection.js';

export default function(table, columns) {
  const map = new Map();
  table.columnNames(x => (map.set(x, x), 0));
  return _select(table, resolve(table, columns, map));
}

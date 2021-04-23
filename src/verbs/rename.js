import _select from '../engine/select';
import resolve from '../helpers/selection';

export default function(table, columns) {
  const map = new Map();
  table.columnNames(x => (map.set(x, x), 0));
  return _select(table, resolve(table, columns, map));
}
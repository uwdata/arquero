import { _select } from './select.js';
import { resolve } from '../helpers/selection.js';

export function rename(table, ...columns) {
  const map = new Map();
  table.columnNames(x => (map.set(x, x), 0));
  return _select(table, resolve(table, columns.flat(), map));
}

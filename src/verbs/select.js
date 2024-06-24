import _select from '../engine/select.js';
import resolve from '../helpers/selection.js';

export default function(table, columns) {
  return _select(table, resolve(table, columns));
}

import _select from '../engine/select';
import resolve from '../helpers/selection';

export default function(table, columns) {
  return _select(table, resolve(table, columns));
}
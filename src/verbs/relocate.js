import _select from '../engine/select';
import resolve from './expr/selection';
import error from '../util/error';
import has from '../util/has';

export default function(table, columns, { before, after } = {}) {
  const bef = before != null;
  const aft = after != null;

  if (!(bef || aft)) {
    error('relocate requires a before or after option.');
  }
  if (bef && aft) {
    error('relocate accepts only one of the before or after options.');
  }

  columns = resolve(table, columns);
  const anchors = Object.keys(resolve(table, bef ? before : after));
  const anchor = bef ? anchors[0] : anchors.pop();
  const _cols = {};

  // marshal inputs to select in desired order
  table.columnNames().forEach(name => {
    // check if we should assign the current column
    const assign = !has(columns, name);

    // at anchor column, insert relocated columns
    if (name === anchor) {
      if (aft && assign) _cols[name] = name;
      Object.assign(_cols, columns);
      if (aft) return; // exit if current column has been handled
    }

    if (assign) _cols[name] = name;
  });

  return _select(table, _cols);
}
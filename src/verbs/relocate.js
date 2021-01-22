import _select from '../engine/select';
import resolve from '../helpers/selection';
import error from '../util/error';

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
  const anchors = [...resolve(table, bef ? before : after).keys()];
  const anchor = bef ? anchors[0] : anchors.pop();
  const select = new Map();

  // marshal inputs to select in desired order
  table.columnNames().forEach(name => {
    // check if we should assign the current column
    const assign = !columns.has(name);

    // at anchor column, insert relocated columns
    if (name === anchor) {
      if (aft && assign) select.set(name, name);
      for (const [key, value] of columns) {
        select.set(key, value);
      }
      if (aft) return; // exit if current column has been handled
    }

    if (assign) select.set(name, name);
  });

  return _select(table, select);
}
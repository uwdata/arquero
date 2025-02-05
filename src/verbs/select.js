import { resolve } from '../helpers/selection.js';
import { columnSet } from '../table/ColumnSet.js';
import { error } from '../util/error.js';
import { isString } from '../util/is-string.js';

export function select(table, ...columns) {
  return _select(table, resolve(table, columns.flat()));
}

export function _select(table, columns) {
  const cols = columnSet();

  columns.forEach((value, curr) => {
    const next = isString(value) ? value : curr;
    if (next) {
      const col = table.column(curr) || error(`Unrecognized column: ${curr}`);
      cols.add(next, col);
    }
  });

  return cols.derive(table);
}

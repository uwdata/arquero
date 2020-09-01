import error from '../../util/error';
import isArray from '../../util/is-array';
import isFunction from '../../util/is-function';
import isObject from '../../util/is-object';
import isNumber from '../../util/is-number';
import isString from '../../util/is-string';

export default function resolve(table, sel, map = {}) {
  sel = isNumber(sel) ? table.columnName(sel) : sel;

  if (isString(sel)) {
    map[sel] = sel;
  } else if (isArray(sel)) {
    sel.forEach(r => resolve(table, r, map));
  } else if (isFunction(sel)) {
    resolve(table, sel(table), map);
  } else if (isObject(sel)) {
    Object.assign(map, sel);
  } else {
    error(`Invalid column selection: ${sel+''}`);
  }

  return map;
}

/**
 * Select all columns in a table.
 * Returns a function-valued selection compatible with {@link Table.select}.
 * @return {Function} Selection function compatible with {@link Table.select}.
 */
export function all() {
  return table => table.columnNames();
}

/**
 * Negate a column selection, to select all other columns in a table.
 * Returns a function-valued selection compatible with {@link Table.select}.
 * @param {...any} selection The selection to negate. May be a column name,
 *  column index, array of either, or a selection function (e.g., from range).
 * @return {Function} Selection function compatible with {@link Table.select}.
 */
export function not(...selection) {
  selection = selection.flat();
  return table => {
    const drop = resolve(table, selection);
    return table.columnNames(name => !drop[name]);
  };
}

/**
 * Select a contiguous range of columns.
 * @param {string|number} start The name/index of the first selected column.
 * @param {string|number} end The name/index of the last selected column.
 * @return {Function} Selection function compatible with {@link Table.select}.
 */
export function range(start, end) {
  return table => {
    const i = isNumber(start) ? start : table.columnIndex(start);
    const j = isNumber(end) ? end : table.columnIndex(end);
    return table.columnNames().slice(i, j + 1);
  };
}
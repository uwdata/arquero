import { isFunction } from '../../util/is-function.js';

/**
 * Return a potentially filtered list of column names.
 * @param {import('../../table/Table.js').Table} table A data table.
 * @param {import('../types.js').ColumnSelectOptions} names The column names to select.
 * @returns {string[]} The selected column names.
 */
export function columns(table, names) {
  // @ts-ignore
  return isFunction(names) ? names(table)
    : names || table.columnNames();
}

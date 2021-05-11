import ColumnTable from './column-table';
import verbs from '../verbs';

// Add verb implementations to ColumnTable prototype
Object.assign(ColumnTable.prototype, verbs);

/**
 * Create a new table for a set of named columns.
 * @param {object|Map} columns
 *  The set of named column arrays. Keys are column names.
 *  The enumeration order of the keys determines the column indices,
 *  unless the names parameter is specified.
 *  Values must be arrays (or array-like values) of identical length.
 * @param {string[]} [names] Ordered list of column names. If specified,
 *  this array determines the column indices. If not specified, the
 *  key enumeration order of the columns object is used.
 * @return {ColumnTable} the instantiated table
 * @example table({ colA: ['a', 'b', 'c'], colB: [3, 4, 5] })
 */
export function table(columns, names) {
  return ColumnTable.new(columns, names);
}

/**
 * Create a new table from an existing object, such as an array of
 * objects or a set of key-value pairs.
 * @param {object|Array|Map} values Data values to populate the table.
 *  If array-valued or iterable, imports rows for each non-null value,
 *  using the provided column names as keys for each row object. If no
 *  names are provided, the first non-null object's own keys are used.
 *  If object- or Map-valued, create columns for the keys and values.
 * @param {string[]} [names] Column names to include.
 *  For object or Map values, specifies the key and value column names.
 *  Otherwise, specifies the keys to look up on each row object.
 * @return {ColumnTable} the instantiated table.
 * @example from([ { colA: 1, colB: 2 }, { colA: 3, colB: 4 } ])
 */
export function from(values, names) {
  return ColumnTable.from(values, names);
}
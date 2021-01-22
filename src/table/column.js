import isFunction from '../util/is-function';

/**
 * Class representing an array-backed data column.
 */
export default class Column {
  /**
   * Create a new column instance.
   * @param {Array} data The backing array (or array-like object)
   *  containing the column data.
   */
  constructor(data) {
    this.data = data;
  }

  /**
   * Get the length (number of rows) of the column.
   * @return {number} The length of the column array.
   */
  get length() {
    return this.data.length;
  }

  /**
   * Get the column value at the given row index.
   * @param {number} row The row index of the value to retrieve.
   * @return {import('./table').DataValue} The column value.
   */
  get(row) {
    return this.data[row];
  }

  /**
   * Returns an iterator over the column values.
   * @return {Iterator<object>} An iterator over column values.
   */
  [Symbol.iterator]() {
    return this.data[Symbol.iterator]();
  }
}

/**
 * Column interface. Any object that adheres to this interface
 * can be used as a data column within a {@link ColumnTable}.
 * @typedef {object} ColumnType
 * @property {number} length
 *  The length (number of rows) of the column.
 * @property {import('./table').ColumnGetter} get
 *  Column value getter.
 */

/**
 * Column factory function interface.
 * @callback ColumnFactory
 * @param {*} data The input column data.
 * @return {ColumnType} A column instance.
 */

/**
 * Create a new column from the given input data.
 * @param {any} data The backing column data. If the value conforms to
 *  the Column interface it is returned directly. If the value is an
 *  array, it will be wrapped in a new Column instance.
 * @return {ColumnType} A compatible column instance.
 */
export let defaultColumnFactory = function(data) {
  return data && isFunction(data.get) ? data : new Column(data);
};

/**
 * Get or set the default factory function for instantiating table columns.
 * @param {ColumnFactory} [factory] The new default factory.
 * @return {ColumnFactory} The current default column factory.
 */
export function columnFactory(factory) {
  return arguments.length
    ? (defaultColumnFactory = factory)
    : defaultColumnFactory;
}
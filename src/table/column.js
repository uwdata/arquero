import isFunction from '../util/is-function';

/**
 * Class representing an array-backed data column.
 * Any object that adheres to this interface can be used as
 * a data column within a {@link ColumnTable}.
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
   * @return {*} The column value.
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
 * Create a new column from the given input data.
 * @param {Array|Column} data The backing column data. If the value
 *  conforms to the Column interface it will be returned directly. If
 *  the value is an array, it will be wrapped in a new Column instance.
 */
Column.from = function(data) {
  return data && isFunction(data.get) ? data : new Column(data);
};

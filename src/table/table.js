import Transformable from './transformable';
import error from '../util/error';
import repeat from '../util/repeat';

/**
 * Abstract class representing a data table.
 */
export default class Table extends Transformable {

  /**
   * Instantiate a new Table instance.
   * @param {string[]} names An ordered list of column names.
   * @param {number} nrows The number of rows.
   * @param {TableData} data The backing data, which can vary by implementation.
   * @param {BitSet} [filter] A bit mask for which rows to include.
   * @param {GroupBySpec} [groups] A groupby specification for grouping ows.
   * @param {RowComparator} [order] A comparator function for sorting rows.
   * @param {Params} [params] Parameter values for table expressions.
   */
  constructor(names, nrows, data, filter, groups, order, params) {
    super(params);
    this._names = Object.freeze(names);
    this._total = nrows;
    this._nrows = filter ? filter.count() : nrows;
    this._data = data;
    this._filter = filter || null;
    this._group = groups || null;
    this._order = order || null;
  }

  /**
   * Create a new table with the same type as this table.
   * The new table may have different data, filter, grouping, or ordering
   * based on the values of the optional configuration argument. If a
   * setting is not specified, it is inherited from the current table.
   * @param {CreateOptions} [options] Creation options for the new table.
   * @return {this} A newly created table.
   */
  create(options) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Provide an informative object string tag.
   */
  get [Symbol.toStringTag]() {
    if (!this._names) return 'Object'; // bail if called on prototype
    const nr = this.numRows() + ' row' + (this.numRows() !== 1 ? 's' : '');
    const nc = this.numCols() + ' col' + (this.numCols() !== 1 ? 's' : '');
    return `Table: ${nc} x ${nr}`
      + (this.isFiltered() ? ` (${this.totalRows()} backing)` : '')
      + (this.isGrouped() ? `, ${this._group.size} groups` : '')
      + (this.isOrdered() ? ', ordered' : '');
  }

  /**
   * Indicates if the table has a filter applied.
   * @return {boolean} True if filtered, false otherwise.
   */
  isFiltered() {
    return !!this._filter;
  }

  /**
   * Indicates if the table has a groupby specification.
   * @return {boolean} True if grouped, false otherwise.
   */
  isGrouped() {
    return !!this._group;
  }

  /**
   * Indicates if the table has a row order comparator.
   * @return {boolean} True if ordered, false otherwise.
   */
  isOrdered() {
    return !!this._order;
  }

  /**
   * Returns the internal table storage data structure.
   * @return {TableData} The backing table storage data structure.
   */
  data() {
    return this._data;
  }

  /**
   * Returns the groupby specification, if defined.
   * @return {GroupBySpec} The groupby specification.
   */
  groups() {
    return this._group;
  }

  /**
   * Returns the row order comparator function, if specified.
   * @return {RowComparator} The row order comparator function.
   */
  comparator() {
    return this._order;
  }

  /**
   * The total number of rows in this table, counting both
   * filtered and unfiltered rows.
   * @return {number} The number of total rows.
   */
  totalRows() {
    return this._total;
  }

  /**
   * The number of active rows in this table. This number may be
   * less than the total rows if the table has been filtered.
   * @see Table.totalRows
   * @return {number} The number of rows.
   */
  numRows() {
    return this._nrows;
  }

  /**
   * The number of columns in this table.
   * @return {number} The number of columns.
   */
  numCols() {
    return this._names.length;
  }

  /**
   * Filter function invoked for each column name.
   * @callback NameFilter
   * @param {string} name The column name.
   * @param {number} index The column index.
   * @param {string[]} array The array of names.
   * @return {boolean} Returns true to retain the column name.
   */

  /**
   * The table column names, optionally filtered.
   * @param {NameFilter} [filter] An optional filter function.
   *  If unspecified, all column names are returned.
   * @return {string[]} An array of matching column names.
   */
  columnNames(filter) {
    return filter ? this._names.filter(filter) : this._names.slice();
  }

  /**
   * The column name at the given index.
   * @param {number} index The column index.
   * @return {string} The column name,
   *  or undefined if the index is out of range.
   */
  columnName(index) {
    return this._names[index];
  }

  /**
   * The column index for the given name.
   * @param {string} name The column name.
   * @return {number} The column index, or -1 if the name is not found.
   */
  columnIndex(name) {
    return this._names.indexOf(name);
  }

  /**
   * Get the value for the given column and row.
   * @param {string} name The column name.
   * @param {number} row The row index.
   * @return {DataValue} The data value at (column, row).
   */
  get(name, row) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Returns an accessor ("getter") function for a column. The returned
   * function takes a row index as its single argument and returns the
   * corresponding column value.
   * @param {string} name The column name.
   * @return {ColumnGetter} The column getter function.
   */
  getter(name) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Returns an array of objects representing table rows.
   * @param {ObjectsOptions} [options] The options for row object generation.
   * @return {RowObject[]} An array of row objects.
   */
  objects(options) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Returns an iterator over objects representing table rows.
   * @return {Iterator<object>} An iterator over row objects.
   */
  [Symbol.iterator]() {
    error('Not implemented');
  }

  /**
   * Print the contents of this table using the console.table() method.
   * @param {ObjectsOptions|number} options The options for row object
   *  generation, determining which rows and columns are printed. If
   *  number-valued, specifies the row limit.
   */
  print(options = {}) {
    if (typeof options === 'number') {
      options = { limit: 10 };
    } else if (options.limit == null) {
      options.limit = 10;
    }

    const obj = this.objects(options);
    const msg = `${this[Symbol.toStringTag]}. Showing ${obj.length} rows.`;

    console.log(msg);   // eslint-disable-line no-console
    console.table(obj); // eslint-disable-line no-console
  }

  /**
   * Returns an array of indices for all rows passing the table filter.
   * @param {boolean} [order=true] A flag indicating if the returned
   *  indices should be sorted if this table is ordered. If false, the
   *  returned indices may or may not be sorted.
   * @return {Uint32Array} An array of row indices.
   */
  indices(order = true) {
    if (this._index) return this._index;

    let i = -1;
    const index = new Uint32Array(this.numRows());
    const ordered = this.isOrdered();
    this.scan(row => index[++i] = row);

    // sort index vector
    if (order && ordered) {
      const compare = this._order;
      const data = this._data;
      index.sort((a, b) => compare(a, b, data));
    }

    // save indices if they reflect table metadata
    if (order || !ordered) {
      this._index = index;
    }

    return index;
  }

  /**
   * Returns an array of indices for each group in the table.
   * If the table is not grouped, the result is the same as
   * {@link indices}, but wrapped within an array.
   * @param {boolean} [order=true] A flag indicating if the returned
   *  indices should be sorted if this table is ordered. If false, the
   *  returned indices may or may not be sorted.
   * @return {number[][]} An array of row index arrays, one per group.
   *  The indices will be filtered if the table is filtered.
   */
  partitions(order = true) {
    // return partitions if already generated
    if (this._partitions) {
      return this._partitions;
    }

    // if not grouped, return a single partition
    if (!this.isGrouped()) {
      return [ this.indices(order) ];
    }

    // generate partitions
    const { keys, size } = this._group;
    const part = repeat(size, () => []);

    // populate partitions, don't sort if indices don't exist
    const sort = !!this._index;
    this.scan(row => part[keys[row]].push(row), sort);

    // if ordered but not yet sorted, sort partitions directly
    if (order && !sort && this.isOrdered()) {
      const compare = this._order;
      const data = this._data;
      for (let i = 0; i < size; ++i) {
        part[i].sort((a, b) => compare(a, b, data));
      }
    }

    // save partitions if they reflect table metadata
    if (order || !this.isOrdered()) {
      this._partitions = part;
    }

    return part;
  }

  /**
   * Callback function to cancel a table scan.
   * @callback ScanStop
   * @return {void}
   */

  /**
   * Callback function invoked for each row of a table scan.
   * @callback ScanVisitor
   * @param {number} [row] The table row index.
   * @param {TableData} [data] The backing table data store.
   * @param {ScanStop} [stop] Function to stop the scan early.
   *  Callees can invoke this function to prevent future calls.
   * @return {void}
   */

  /**
   * Perform a table scan, visiting each row of the table.
   * If this table is filtered, only rows passing the filter are visited.
   * @param {ScanVisitor} fn Callback invoked for each row of the table.
   * @param {boolean} [order=false] Indicates if the table should be
   *  scanned in the order determined by {@link Table#orderby}. This
   *  argument has no effect if the table is unordered.
   * @property {number} [limit=Infinity] The maximum number of objects to create.
   * @property {number} [offset=0] The row offset indicating how many initial rows to skip.
   */
  scan(fn, order, limit = Infinity, offset = 0) {
    const filter = this._filter;
    const nrows = this._nrows;
    const data = this._data;

    let i = offset || 0;
    if (i > nrows) return;

    const n = Math.min(nrows, i + limit);
    const stop = () => i = this._total;

    if (order && this.isOrdered() || filter && this._index) {
      const index = this.indices();
      const data = this._data;
      for (; i < n; ++i) {
        fn(index[i], data, stop);
      }
    } else if (filter) {
      let c = n - i + 1;
      for (i = filter.nth(i); --c; i = filter.next(i + 1)) {
        fn(i, data, stop);
      }
    } else {
      for (; i < n; ++i) {
        fn(i, data, stop);
      }
    }
  }

  /**
   * Reduce a table, processing all rows to produce a new table.
   * To produce standard aggregate summaries, use {@link rollup}.
   * This method allows the use of custom reducer implementations,
   * for example to produce multiple rows for an aggregate.
   * @param {Reducer} reducer The reducer to apply.
   * @return {Table} A new table of reducer outputs.
   */
  reduce(reducer) {
    return this.__reduce(this, reducer);
  }
}

/**
 * Backing table data.
 * @typedef {object|Array} TableData
 */

/**
 * Table value.
 * @typedef {*} DataValue
 */

/**
 * Table row object.
 * @typedef {Object.<string, DataValue>} RowObject
 */

/**
 * Table expression parameters.
 * @typedef {import('./transformable').Params} Params
 */

/**
 * Proxy type for BitSet class.
 * @typedef {typeof import('./bit-set')} BitSet
 */

/**
 * A table groupby specification.
 * @typedef {object} GroupBySpec
 * @property {number} size The number of groups.
 * @property {string[]} names Column names for each group.
 * @property {RowExpression[]} get Value accessor functions for each group.
 * @property {number[]} rows Indices of an example table row for each group.
 * @property {number[]} keys Per-row group indices, length is total rows of table.
 */

/**
 * Column value accessor.
 * @callback ColumnGetter
 * @param {number} [row] The table row.
 * @return {DataValue}
 */

/**
 * An expression evaluated over a table row.
 * @callback RowExpression
 * @param {number} [row] The table row.
 * @param {TableData} [data] The backing table data store.
 * @return {DataValue}
 */

/**
 * Comparator function for sorting table rows.
 * @callback RowComparator
 * @param {number} rowA The table row index for the first row.
 * @param {number} rowB The table row index for the second row.
 * @param {TableData} data The backing table data store.
 * @return {number} Negative if rowA < rowB, positive if
 *  rowA > rowB, otherwise zero.
 */

/**
 * Options for derived table creation.
 * @typedef {object} CreateOptions
 * @property {TableData} [data] The backing column data.
 * @property {string[]} [names] An ordered list of column names.
 * @property {BitSet} [filter] An additional filter BitSet to apply.
 * @property {GroupBySpec} [groups] The groupby specification to use, or null for no groups.
 * @property {RowComparator} [order] The orderby comparator function to use, or null for no order.
 */

/**
 * Options for generating row objects.
 * @typedef {object} ObjectsOptions
 * @property {number} [limit=Infinity] The maximum number of objects to create.
 * @property {number} [offset=0] The row offset indicating how many initial rows to skip.
 */
import { nest, regroup, reindex } from './regroup.js';
import { rowObjectBuilder } from '../expression/row-object.js';
import { all, resolve } from '../helpers/selection.js';
import { arrayType } from '../util/array-type.js';
import { error } from '../util/error.js';
import { isArrayType } from '../util/is-array-type.js';
import { isNumber } from '../util/is-number.js';
import { repeat } from '../util/repeat.js';

/**
 * Base class representing a column-oriented data table.
 */
export class Table {
  /**
   * Instantiate a Table instance.
   * @param {import('./types.js').ColumnData} columns
   *  An object mapping column names to values.
   * @param {string[]} [names]
   *  An ordered list of column names.
   * @param {import('./BitSet.js').BitSet} [filter]
   *  A filtering BitSet.
   * @param {import('./types.js').GroupBySpec} [group]
   *  A groupby specification.
   * @param {import('./types.js').RowComparator} [order]
   *  A row comparator function.
   * @param {import('./types.js').Params} [params]
   *  An object mapping parameter names to values.
   */
  constructor(columns, names, filter, group, order, params) {
    const data = Object.freeze({ ...columns });
    names = names?.slice() ?? Object.keys(data);
    const nrows = names.length ? data[names[0]].length : 0;
    /**
     * @private
     * @type {readonly string[]}
     */
    this._names = Object.freeze(names);
    /**
     * @private
     * @type {import('./types.js').ColumnData}
     */
    this._data = data;
    /**
     * @private
     * @type {number}
     */
    this._total = nrows;
    /**
     * @private
     * @type {number}
     */
    this._nrows = filter?.count() ?? nrows;
    /**
     * @private
     * @type {import('./BitSet.js').BitSet}
     */
    this._mask = filter ?? null;
    /**
     * @private
     * @type {import('./types.js').GroupBySpec}
     */
    this._group = group ?? null;
    /**
     * @private
     * @type {import('./types.js').RowComparator}
     */
    this._order = order ?? null;
    /**
     * @private
     * @type {import('./types.js').Params}
     */
    this._params = params;
    /**
     * @private
     * @type {Uint32Array}
     */
    this._index = null;
    /**
     * @private
     * @type {number[][] | Uint32Array[]}
     */
    this._partitions = null;
  }

  /**
   * Create a new table with the same type as this table.
   * The new table may have different data, filter, grouping, or ordering
   * based on the values of the optional configuration argument. If a
   * setting is not specified, it is inherited from the current table.
   * @param {import('./types.js').CreateOptions} [options]
   *  Creation options for the new table.
   * @return {this} A newly created table.
   */
  create({
    data = undefined,
    names = undefined,
    filter = undefined,
    groups = undefined,
    order = undefined
  } = {}) {
    const f = filter !== undefined ? filter : this.mask();
    // @ts-ignore
    return new this.constructor(
      data || this._data,
      names || (!data ? this._names : null),
      f,
      groups !== undefined ? groups : regroup(this._group, filter && f),
      order !== undefined ? order : this._order,
      this._params
    );
  }

  /**
   * Get or set table expression parameter values.
   * If called with no arguments, returns the current parameter values
   * as an object. Otherwise, adds the provided parameters to this
   * table's parameter set and returns the table. Any prior parameters
   * with names matching the input parameters are overridden.
   * @param {import('./types.js').Params} [values]
   *  The parameter values.
   * @return {this|import('./types.js').Params}
   *  The current parameter values (if called with no arguments) or this table.
   */
  params(values) {
    if (arguments.length) {
      if (values) {
        this._params = { ...this._params, ...values };
      }
      return this;
    } else {
      return this._params;
    }
  }

  /**
   * Provide an informative object string tag.
   */
  get [Symbol.toStringTag]() {
    if (!this._names) return 'Object'; // bail if called on prototype
    const nr = this.numRows();
    const nc = this.numCols();
    const plural = v => v !== 1 ? 's' : '';
    return `Table: ${nc} col${plural(nc)} x ${nr} row${plural(nr)}`
      + (this.isFiltered() ? ` (${this.totalRows()} backing)` : '')
      + (this.isGrouped() ? `, ${this._group.size} groups` : '')
      + (this.isOrdered() ? ', ordered' : '');
  }

  /**
   * Indicates if the table has a filter applied.
   * @return {boolean} True if filtered, false otherwise.
   */
  isFiltered() {
    return !!this._mask;
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
   * Get the backing column data for this table.
   * @return {import('./types.js').ColumnData}
   *  Object of named column instances.
   */
  data() {
    return this._data;
  }

  /**
   * Returns the filter bitset mask, if defined.
   * @return {import('./BitSet.js').BitSet} The filter bitset mask.
   */
  mask() {
    return this._mask;
  }

  /**
   * Returns the groupby specification, if defined.
   * @return {import('./types.js').GroupBySpec} The groupby specification.
   */
  groups() {
    return this._group;
  }

  /**
   * Returns the row order comparator function, if specified.
   * @return {import('./types.js').RowComparator}
   *  The row order comparator function.
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
   * less than the *totalRows* if the table has been filtered.
   * @return {number} The number of rows.
   */
  numRows() {
    return this._nrows;
  }

  /**
   * The number of active rows in this table. This number may be
   * less than the *totalRows* if the table has been filtered.
   * @return {number} The number of rows.
   */
  get size() {
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
   * Get the column instance with the given name.
   * @param {string} name The column name.
   * @return {import('./types.js').ColumnType | undefined}
   *  The named column, or undefined if it does not exist.
   */
  column(name) {
    return this._data[name];
  }

  /**
   * Get the column instance at the given index position.
   * @param {number} index The zero-based column index.
   * @return {import('./types.js').ColumnType | undefined}
   *  The column, or undefined if it does not exist.
   */
  columnAt(index) {
    return this._data[this._names[index]];
  }

  /**
   * Get an array of values contained in a column. The resulting array
   * respects any table filter or orderby criteria.
   * @param {string} name The column name.
   * @param {ArrayConstructor | import('./types.js').TypedArrayConstructor} [constructor=Array]
   *  The array constructor for instantiating the output array.
   * @return {import('./types.js').DataValue[] | import('./types.js').TypedArray}
   *  The array of column values.
   */
  array(name, constructor = Array) {
    const column = this.column(name);
    const array = new constructor(this.numRows());
    let idx = -1;
    this.scan(row => array[++idx] = column.at(row), true);
    return array;
  }

  /**
   * Get the value for the given column and row.
   * @param {string} name The column name.
   * @param {number} [row=0] The row index, defaults to zero if not specified.
   * @return {import('./types.js').DataValue} The table value at (column, row).
   */
  get(name, row = 0) {
    const column = this.column(name);
    return this.isFiltered() || this.isOrdered()
      ? column.at(this.indices()[row])
      : column.at(row);
  }

  /**
   * Returns an accessor ("getter") function for a column. The returned
   * function takes a row index as its single argument and returns the
   * corresponding column value.
   * @param {string} name The column name.
   * @return {import('./types.js').ColumnGetter} The column getter function.
   */
  getter(name) {
    const column = this.column(name);
    const indices = this.isFiltered() || this.isOrdered() ? this.indices() : null;
    if (indices) {
      return row => column.at(indices[row]);
    } else if (column) {
      return row => column.at(row);
    } else {
      error(`Unrecognized column: ${name}`);
    }
  }

  /**
   * Returns an object representing a table row.
   * @param {number} [row=0] The row index, defaults to zero if not specified.
   * @return {object} A row object with named properties for each column.
   */
  object(row = 0) {
    return objectBuilder(this)(row);
  }

  /**
   * Returns an array of objects representing table rows.
   * @param {import('./types.js').ObjectsOptions} [options]
   *  The options for row object generation.
   * @return {object[]} An array of row objects.
   */
  objects(options = {}) {
    const { grouped, limit, offset } = options;

    // generate array of row objects
    const names = resolve(this, options.columns || all());
    const createRow = rowObjectBuilder(this, names);
    const obj = [];
    this.scan(
      (row, data) => obj.push(createRow(row, data)),
      true, limit, offset
    );

    // produce nested output as requested
    if (grouped && this.isGrouped()) {
      const idx = [];
      this.scan(row => idx.push(row), true, limit, offset);
      return nest(this, idx, obj, grouped);
    }

    return obj;
  }

  /**
   * Returns an iterator over objects representing table rows.
   * @return {Iterator<object>} An iterator over row objects.
   */
  *[Symbol.iterator]() {
    const createRow = objectBuilder(this);
    const n = this.numRows();
    for (let i = 0; i < n; ++i) {
      yield createRow(i);
    }
  }

  /**
   * Returns an iterator over column values.
   * @return {Iterator<object>} An iterator over row objects.
   */
  *values(name) {
    const get = this.getter(name);
    const n = this.numRows();
    for (let i = 0; i < n; ++i) {
      yield get(i);
    }
  }

  /**
   * Print the contents of this table using the console.table() method.
   * @param {import('./types.js').PrintOptions|number} options
   *  The options for row object generation, determining which rows and
   *  columns are printed. If number-valued, specifies the row limit.
   * @return {this} The table instance.
   */
  print(options = {}) {
    const opt = isNumber(options)
      ? { limit: +options }
      // @ts-ignore
      : { ...options, limit: 10 };

    const obj = this.objects({ ...opt, grouped: false });
    const msg = `${this[Symbol.toStringTag]}. Showing ${obj.length} rows.`;

    console.log(msg);   // eslint-disable-line no-console
    console.table(obj); // eslint-disable-line no-console
    return this;
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

    const n = this.numRows();
    const index = new Uint32Array(n);
    const ordered = this.isOrdered();
    const bits = this.mask();
    let row = -1;

    // inline the following for performance:
    // this.scan(row => index[++i] = row);
    if (bits) {
      for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
        index[++row] = i;
      }
    } else {
      for (let i = 0; i < n; ++i) {
        index[++row] = i;
      }
    }

    // sort index vector
    if (order && ordered) {
      const { _order, _data } = this;
      index.sort((a, b) => _order(a, b, _data));
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
   * the *indices* method, but wrapped within an array.
   * @param {boolean} [order=true] A flag indicating if the returned
   *  indices should be sorted if this table is ordered. If false, the
   *  returned indices may or may not be sorted.
   * @return {number[][] | Uint32Array[]} An array of row index arrays, one
   *  per group. The indices will be filtered if the table is filtered.
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
    // inline the following for performance:
    // this.scan(row => part[keys[row]].push(row), sort);
    const sort = this._index;
    const bits = this.mask();
    const n = this.numRows();
    if (sort && this.isOrdered()) {
      for (let i = 0, r; i < n; ++i) {
        r = sort[i];
        part[keys[r]].push(r);
      }
    } else if (bits) {
      for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
        part[keys[i]].push(i);
      }
    } else {
      for (let i = 0; i < n; ++i) {
        part[keys[i]].push(i);
      }
    }

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
   * Create a new fully-materialized instance of this table.
   * All filter and orderby settings are removed from the new table.
   * Instead, the backing data itself is filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {this} A reified table.
   */
  reify(indices) {
    const nrows = indices ? indices.length : this.numRows();
    const names = this._names;
    let data, groups;

    if (!indices && !this.isOrdered()) {
      if (!this.isFiltered()) {
        return this; // data already reified
      } else if (nrows === this.totalRows()) {
        data = this.data(); // all rows pass filter, skip copy
      }
    }

    if (!data) {
      const scan = indices ? f => indices.forEach(f) : f => this.scan(f, true);
      const ncols = names.length;
      data = {};

      for (let i = 0; i < ncols; ++i) {
        const name = names[i];
        const prev = this.column(name);
        const curr = data[name] = new (arrayType(prev))(nrows);
        let r = -1;
        // optimize array access
        isArrayType(prev)
          ? scan(row => curr[++r] = prev[row])
          : scan(row => curr[++r] = prev.at(row));
      }

      if (this.isGrouped()) {
        groups = reindex(this.groups(), scan, !!indices, nrows);
      }
    }

    return this.create({ data, names, groups, filter: null, order: null });
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
   * @param {import('./types.js').ColumnData} [data]
   *  The backing table data store.
   * @param {ScanStop} [stop] Function to stop the scan early.
   *  Callees can invoke this function to prevent future calls.
   * @return {void}
   */

  /**
   * Perform a table scan, visiting each row of the table.
   * If this table is filtered, only rows passing the filter are visited.
   * @param {ScanVisitor} fn Callback invoked for each row of the table.
   * @param {boolean} [order=false] Indicates if the table should be
   *  scanned in the order determined by *orderby*. This
   *  argument has no effect if the table is unordered.
   * @property {number} [limit=Infinity] The maximum number of rows to scan.
   * @property {number} [offset=0] The row offset indicating how many
   *  initial rows to skip.
   */
  scan(fn, order, limit = Infinity, offset = 0) {
    const filter = this._mask;
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
      for (i = filter.nth(i); --c && i > -1; i = filter.next(i + 1)) {
        fn(i, data, stop);
      }
    } else {
      for (; i < n; ++i) {
        fn(i, data, stop);
      }
    }
  }
}

function objectBuilder(table) {
  let b = table._builder;

  if (!b) {
    const createRow = rowObjectBuilder(table);
    const data = table.data();
    if (table.isOrdered() || table.isFiltered()) {
      const indices = table.indices();
      b = row => createRow(indices[row], data);
    } else {
      b = row => createRow(row, data);
    }
    table._builder = b;
  }

  return b;
}

import error from '../util/error';
import repeat from '../util/repeat';

/**
 * Abstract class representing a data table.
 */
export default class Table {
  /**
   * Construct a new Table instance.
   * @param {string[]} names - An array of column names.
   * @param {number} nrows - The number of rows.
   * @param {*} data - The backing data, which can vary by implementation.
   * @param {BitSet} [filter] - A bit mask for which rows to include.
   * @param {Object} [groups] - Row grouping criteria.
   * @param {string[]} [groups.names] - Output column names for grouping variables.
   * @param {function[]} [groups.get] - Accessor functions for grouping variables.
   * @param {function} [order] - A comparator function for sorting rows.
   * @param {number[]} [index] - Row index array, overrides filter.
   */
  constructor(names, nrows, data, filter, groups, order, index) {
    this._names = Object.freeze(names);
    this._total = nrows;
    this._nrows = filter ? filter.count() : nrows;
    this._data = data;
    this._filter = filter || null;
    this._group = groups || null;
    this._order = order || null;

    // update table data if explicit indices are provided
    if (index) {
      this._nrows = index.length;
      this._filter = true;
      this._index = index;
      if (order) index.sort((a, b) => order(a, b, data));
    }
  }

  get [Symbol.toStringTag]() {
    if (!this._names) return 'Object';
    const nr = this.numRows() + ' row' + (this.numRows() !== 1 ? 's' : '');
    const nc = this.numCols() + ' col' + (this.numCols() !== 1 ? 's' : '');
    return `Table: ${nc} x ${nr}`
      + (this.isFiltered() ? ` (${this.totalRows()} backing)` : '')
      + (this.isGrouped() ? `, ${this._group.size} groups` : '')
      + (this.isOrdered() ? ', ordered' : '');
  }

  /**
   * Create a new table with the same type as this table.
   * The new table may have different data, filter, grouping, or ordering
   * based on the values of the optional configuration argument. If a
   * setting is not specified, it will be inherited from the current table.
   * @param {Object} [config] Configuration settings for the new table:
   *  - data: The data payload to use.
   *  - filter: An additional filter bitset to apply.
   *  - groups: The groupby setting to use (or null for no groups).
   *  - order: The orderby comparator to use (or null for no order).
   * @return {Table} A newly created table.
   */
  create({ data, filter, groups, order }) { // eslint-disable-line no-unused-vars
  }

  /**
   * Create a new fully-materialized instance of this table.
   * Any filter, groupby, or orderby settings are removed from the new table.
   * Instead, the backing data itself will be filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {Table} A reified table.
   */
  reify(indices) { // eslint-disable-line no-unused-vars
  }

  /**
   * Indicates if the table's backing data is filtered.
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
   * Returns the internal table storate data structure.
   * @return {*} The backing table storage data structure.
   */
  data() {
    return this._data;
  }

  /**
   * A table groupby specification.
   * @typedef {Object} GroupBySpec
   * @property {number} size - The number of groups.
   * @property {string[]} names - Column names for each group.
   * @property {Function[]} get - Value accessor functions for each group.
   * @property {number[]} rows - Indices of an example table row for each group.
   * @property {number[]} keys - Per-row group indices, length is total rows of table.
   */

  /**
   * Returns the groupby specification, if defined.
   * @return {GroupBySpec} The groupby specification.
   */
  groups() {
    return this._group;
  }

  /**
   * Returns the row order comparator function, if specified.
   * @return {Function} The row order comparator function.
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
   * less than the total rows if this table has been filtered.
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
   * @callback nameFilter
   * @param {string} name The column name.
   * @param {number} index The column index.
   * @param {string[]} array The array of names.
   * @return {boolean} Returns true to retain the column name.
   */

  /**
   * The table column names, optionally filtered.
   * @param {nameFilter} [filter] An optional filter function.
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
   * The column indexx for the given name.
   * @param {string} The column name.
   * @return {number} The column index, or -1 if the name is not found.
   */
  columnIndex(name) {
    return this._names.indexOf(name);
  }

  /**
   * Returns an array of indices for all rows passing the table filter.
   * @param {boolean} [ordered=false] A flag indicating if the returned
   *  indices should be sorted. Only applies if the table is ordered.
   * @return {number[]} An array of row indices.
   */
  indices(ordered) {
    if (this._index) return this._index;

    let i = -1;
    const index = new Uint32Array(this.numRows());
    this.scan(row => index[++i] = row);

    // sort index vector
    if (ordered && this.isOrdered()) {
      const compare = this._order;
      const data = this._data;
      index.sort((a, b) => compare(a, b, data));
    }

    return index;
  }

  /**
   * Returns an array of indices for each group in the table.
   * If the table is not grouped, this method the results is the same
   * as {@link indices}, but wrapped within an array.
   * @return {number[][]} An array of row index arrays, one per group.
   *  The indices will be sorted and/or filtered if the table is
   *  ordered or filtered.
   */
  partitions() {
    // return partitions if already generated
    if (this._partitions) {
      return this._partitions;
    }

    // if not grouped, return a single partition
    if (!this.isGrouped()) {
      return [this._index = this.indices(true)];
    }

    // generate partitions
    const { keys, size } = this._group;
    const part = repeat(size, () => []);
    const order = !!this._index;
    this.scan(row => part[keys[row]].push(row), order);

    // if ordered but not yet sorted, sort partitions directly
    if (this.isOrdered() && !order) {
      const compare = this._order;
      const data = this._data;
      for (let i = 0; i < size; ++i) {
        part[i].sort((a, b) => compare(a, b, data));
      }
    }

    return this._partitions = part;
  }

  /**
   * Returns an array of tuple objects representing a table row.
   * The tuples act as proxy objects to the underlying table data.
   * @return {Array} An array of tuple objects.
   */
  tuples() {
    error('Not implemented');
  }

  /**
   * Get the value for the given column and row.
   * @param {string} name The column name.
   * @param {number} row The row index.
   * @return {*} The table value at (column, row).
   */
  get(name, row) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Callback function invoked for each row of a table scan.
   * @callback scanVisitor
   * @param {number} row The table row index.
   * @param {Object|Array} data The backing table data.
   */

  /**
   * Perform a table scan, visiting each row of the table.
   * If this table is filtered, only rows passing the filter are visited.
   * @param {scanVisitor} fn Callback invoked for each row of the table.
   * @param {boolean} [ordered=false] Indicates if the table should be
   *  scanned in the order determined by {@link orderby}. Has no effect
   *  if this table is unordered.
   */
  scan(fn, ordered) {
    const filter = this._filter;
    const data = this._data;

    if (ordered && this.isOrdered() || filter && this._index) {
      const index = this._index = this.indices(true);
      const nrows = index.length;
      const data = this._data;
      for (let i = 0; i < nrows; ++i) {
        fn(index[i], data);
      }
    } else if (filter) {
      for (let row = filter.next(0); row >= 0; row = filter.next(row + 1)) {
        fn(row, data);
      }
    } else {
      const total = this._total;
      for (let row = 0; row < total; ++row) {
        fn(row, data);
      }
    }
  }

  // -- Transformation Verbs ------------------------------------------------

  /**
   * Count the number of values in a group. This method is a shorthand
   * for {@link Table.rollup} with a count aggregate function.
   * @param {string} [as='count'] The name of the output count column.
   * @return {Table} A new table with groupby and count columns.
   * @example table.groubby('colA').count()
   */
  count(as = 'count') {
    return this.rollup({ [as]: '() => count()' });
  }

  /**
   * De-duplicate table rows by removing repeated values.
   * @param  {...any} [values] Key columns to check for duplicates.
   *  Two rows are considered duplicates if they have matching values
   *  for all keys. If unspecified, all columns are used.
   * @return {Table} A new de-duplicated table.
   * @example table.dedupe()
   * @example table.dedupe('a', 'b')
   */
  dedupe(...values) {
    return this.__dedupe(this, values.flat());
  }

  /**
   * Derive new column values based on the provided expressions.
   * @param {object} values Name-value pairs defining columns to derive.
   * @return {Table} A new table with derived columns added.
   * @example table.derive({ sumXY: d => d.x + d.y })
   */
  derive(values) {
    return this.__derive(this, values);
  }

  /**
   * Filter a table to a subset of rows based on the input criteria.
   * The resulting table provides a filtered view over the original data;
   * no data copy is made. To create a table that copies only the filtered
   * data to new data structures, call {@link reify} on the output table.
   * @param {*} criteria The filter criteria.
   * @return {Table} A new table with filtered rows.
   * @example table.filter(d => abs(d.value) < 5)
   */
  filter(criteria) {
    return this.__filter(this, criteria);
  }

  /**
   * Fold one or more columns into two key-value pair columns.
   * The fold transform is an inverse of the {@link Table#pivot} transform.
   * The resulting table has two new columns, one containing the column
   * names (named "key") and the other the column values (named "value").
   * The number of output rows equals the original row count multiplied
   * by the number of folded columns.
   * @param {*} values The columns to fold.
   * @return {Table} A new folded table.
   * @example table.fold('colA', 'colB')
   */
  fold(...values) {
    return this.__fold(this, values.flat());
  }

  /**
   * Lookup values from a secondary table and add them as new columns.
   * A lookup occurs upon matching key values for rows in both tables.
   * If the secondary table has multiple rows with the same key, only
   * the last observed instance will be considered in the lookup.
   * @param {Table} table The secondary table to look up values from.
   * @param {Array} on A two-element array of lookup keys (string or function)
   *  for this table and the secondary table.
   * @param {*} values The column values to add from the secondary table.
   * @return {Table} A new table with lookup values added.
   * @example table.lookup(table2, 'key1', 'key2', ['value1', 'value2'])
   */
  lookup(table, on, values) {
    return this.__lookup(this, table, on, values);
  }

  /**
   * Pivot columns into a cross-tabulation.
   * The pivot transform is an inverse of the {@link Table#fold} transform.
   * The resulting table has new columns for each unique combination
   * of the provided "keys", populated with the provided "values".
   * The provided values must be aggregates, as a single set of keys may include
   * more than one row; if string-valued, the "any" aggregate is used.
   * If only one "values" column is defined, the new pivoted columns will
   * be named using key values only. Otherwise, the value column names
   * will be included as a component of the output column names.
   * @param {*} keys Grouping column(s) defining names for pivoted columns.
   * @param {*} values Column(s) defining values for pivoted columns.
   * @param {*} options An options object. The supported keys are:
   *  - limit: The maximum number of new columns to generate (default Infinity).
   *  - keySeparator: string to place between multiple key names (default "_").
   *  - valueSeparator: string to place between key and value names (default "_").
   *  - sort: Boolean flag for alphabetical sorting of new column names (default true).
   * @return {Table} A new pivoted table.
   * @example table.pivot('key', 'value')
   * @example table.pivot({ key: d => d.key }, { value: d => sum(d.value) })
   */
  pivot(keys, values, options) {
    return this.__pivot(this, keys, values, options);
  }

  /**
   * Group table rows based on a set of column values.
   * Subsequent operations that are sensitive to grouping (such as
   * aggregate functions) will operate over the data groups.
   * @param  {...any} values
   * @return {Table} A new table with grouped rows.
   * @example table.groupby('colA', 'colB')
   * @example table.groupby(d => d.colA + d.colB)
   */
  groupby(...values) {
    return this.__groupby(this, values.flat());
  }

  /**
   * Order table rows based on a set of column values.
   * Subsequent operations sensitive to ordering (such as window functions)
   * will operate over sorted values.
   * The resulting table provides an view over the original data, without
   * any copying. To create a table with sorted data copied to new data
   * strucures, call {@link reify} on the result of this method.
   * To undo ordering, use {@link unorder}.
   * @param  {...any} values Values to sort by, in precedence order.
   *  By default, sorting is done in ascending order.
   *  To sort in descending order, use {@link desc}.
   *  If a string, order by the column with that name.
   *  If a number, order by the column with that index.
   *  If an object, object values must be valid values parameters;
   *  object keys will be ignored.
   *  If an array, array values must be valid values parameters.
   *  If a function, must be a valid table expression; aggregate functions
   *  are allowed, window functions are not.
   * @return {Table} A new ordered table.
   * @example table.orderby('a', desc('b'))
   * @example table.orderby({ a: 'a', b: desc('b') )})
   * @example table.orderby(desc(d => d.a))
   */
  orderby(...values) {
    return this.__orderby(this, values.flat());
  }

  /**
   * Reduce a table, processing all rows to produce a new table.
   * To produce standard aggregate summaries, use {@link rollup}.
   * This method allows the use of custom reducer implementations,
   * for example to produce multiple rows for an aggregate.
   * @param  {Reducer} reducer The reducer to apply.
   * @return {Table} A new table of reducer outputs.
   */
  reduce(reducer) {
    return this.__reduce(this, reducer);
  }

  /**
   * Rollup a table to an aggregate summary.
   * To produce record counts only, {@link count} is a convenient shortcut.
   * @param {*} values
   * @return {Table} A new table of aggregate summary values.
   * @example table.groupby('colA').rollup({ mean: d => mean(d.colB) })
   */
  rollup(values) {
    return this.__rollup(this, values);
  }

  /**
   * Generate a table from a random sample of rows.
   * @param  {number} size The number of samples to draw.
   * @return {Table} A new table with filtered rows, or this table
   *  if the numeber of rows is smaller than the sample size.
   * @example table.sample(50)
   * @example table.sample(100, { replace: true })
   */
  sample(size, options) {
    return this.__sample(this, size, options);
  }

  /**
   * Select columns into a new table.
   * @param  {...any} columns
   * @return {Table} A new table of selected columns.
   * @example table.groupby('colA').rollup({ mean: d => mean(d.colB) })
   */
  select(...columns) {
    return this.__select(this, columns.flat());
  }

  /**
   * Spread array elements into a set of new columns.
   * Output columns are named using the value key and array index.
   * @param {Array|Object} values The columns to spread, as either
   *  an array of names or a key-value object of table expressions.
   * @param {Object} [options] Additional options.
   * @param {number} [options.limit] Limit the number of columns
   *   generated for each array.
   * @return {Table} A new table with spread columns added.
   * @example table.spread({ a: split(d.text, '') })
   */
  spread(values, options) {
    return this.__spread(this, values, options);
  }

  /**
   * Ungroup a table, removing any grouping criteria.
   * @return {Table} A new ungrouped table, or this table if not grouped.
   * @example table.ungroup()
   */
  ungroup() {
    return this.__ungroup(this);
  }

  /**
   * Unorder a table, removing any sorting criteria.
   * @return {Table} A new unordered table, or this table if not ordered.
   * @example table.unorder()
   */
  unorder() {
    return this.__unorder(this);
  }

  /**
   * Unroll one or more array-valued columns into new rows.
   * If more than one array value is used, the number of new rows
   * will be the smaller of the limit and the largest length.
   * Values for all other columns are copied over.
   * @param {*} values
   * @param {Object} [options] Additional options.
   * @param {number} [options.limit] Limit the number of rows
   *   generated for each array.
   * @return {Table} A new unrolled table.
   * @example table.unroll('colA', 1000)
   */
  unroll(values, options) {
    return this.__unroll(this, values, options);
  }

  // -- Joins ---------------------------------------------------------------

  /**
   * Options to join transformations.
   * If both the left and right options are true, indicates a full outer join.
   * @typedef {Object} JoinOptions
   * @property {boolean} [left=false] Flag indicating a left outer join.
   * @property {boolean} [right=false] Flag indicating a right outer join.
   * @property {string[]} [suffix=['_1', '_2']] Column name suffixes to
   *  append if two columns with the same name are produced by the join.
   */

  /**
   * Join two tables, extending the columns of one table with
   * values from the other table. The current table is considered
   * the "left" table in the join, and the new table input is
   * considered the "right" table in the join. By default an inner
   * join is performed, removing all rows that do not match the
   * join criteria. To perform left, right, or full outer joins, use
   * the {@link Table#join_left}, {@link Table#join_right}, or
   * {@link Table#join_full} methods, or provide an options argument.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  will be compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join.
   * @return {Table} A new joined table.
   * @example table.join(other, ['keyL', 'keyR'])
   * @example table.join(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join(other, on, values, options) {
    return this.__join(this, other, on, values, options);
  }

  /**
   * Perform a left outer join on two tables. Rows in the left table
   * that do not match a row in the right table will be preserved.
   * @see Table#join
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  will be compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: true, right: false}.
   * @return {Table} A new joined table.
   * @example table.join_left(other, ['keyL', 'keyR'])
   * @example table.join_left(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_left(other, on, values, options) {
    const opt = { ...options, left: true, right: false };
    return this.__join(this, other, on, values, opt);
  }

  /**
   * Perform a right outer join on two tables. Rows in the right table
   * that do not match a row in the left table will be preserved.
   * @see Table#join
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  will be compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: false, right: true}.
   * @return {Table} A new joined table.
   * @example table.join_right(other, ['keyL', 'keyR'])
   * @example table.join_right(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_right(other, on, values, options) {
    const opt = { ...options, left: false, right: true };
    return this.__join(this, other, on, values, opt);
  }

  /**
   * Perform a full outer join on two tables. Rows in either the left or
   * right table that do not match a row in the other will be preserved.
   * @see Table#join
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  will be compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: false, right: true}.
   * @return {Table} A new joined table.
   * @example table.join_full(other, ['keyL', 'keyR'])
   * @example table.join_full(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_full(other, on, values, options) {
    const opt = { ...options, left: true, right: true };
    return this.__join(this, other, on, values, opt);
  }

  /**
   * Perform a semi-join, filtering the left table to only rows that
   * match a row in the right table.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  will be compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @return {Table} A new filtered table.
   */
  semijoin(other, on) {
    return this.__join_filter(this, other, on);
  }

  /**
   * Perform a anti-join, filtering the left table to only rows that
   * do *not* match a row in the right table.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  will be compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @return {Table} A new filtered table.
   */
  antijoin(other, on) {
    return this.__join_filter(this, other, on, { anti: true });
  }

  // -- Set Operations ------------------------------------------------------

  /**
   * Concatenate multiple tables into a single table, preserving all rows.
   * This transformation mirrors the UNION_ALL operation in SQL.
   * Only named columns in this table are included in the output.
   * @see Table#union
   * @param  {...any} tables A list of tables to concatenate.
   * @return {Table} A new concatenated table.
   */
  concat(...tables) {
    return this.__concat(this, tables.flat());
  }

  /**
   * Union multiple tables into a single table, deduplicating all rows.
   * This transformation mirrors the UNION operation in SQL. It is
   * similar to {@link Table#concat} but suppresses duplicate rows with
   * values identical to another row.
   * Only named columns in this table are included in the output.
   * @see Table#concat
   * @param  {...any} tables A list of tables to union.
   * @return {Table} A new unioned table.
   */
  union(...tables) {
    return this.__union(this, tables.flat());
  }

  /**
   * Intersect multiple tables, keeping only rows whose with identical
   * values for all columns in all tables, and deduplicates the rows.
   * This transformation is similar to a series of {@link Table#semijoin}
   * calls, but suppresses duplicate rows.
   * @see Table#semijoin
   * @param  {...any} tables A list of tables to intersect.
   * @return {Table} A new filtered table.
   */
  intersect(...tables) {
    return this.__intersect(this, tables.flat());
  }

  /**
   * Compute the set difference with multiple tables, keeping only rows in
   * this table that whose values do not occur in the other tables.
   * This transformation is similar to a series of {@link Table#antijoin}
   * calls, but suppresses duplicate rows.
   * @see Table#antijoin
   * @param  {...any} tables A list of tables to intersect.
   * @return {Table} A new filtered table.
   */
  except(...tables) {
    return this.__except(this, tables.flat());
  }
}
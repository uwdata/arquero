import error from '../util/error';
import repeat from '../util/repeat';
import { numRows } from '../format/util';

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
   * Create a new table with the same type as this table.
   * The new table may have different data, filter, grouping, or ordering
   * based on the values of the optional configuration argument. If a
   * setting is not specified, it is inherited from the current table.
   * @param {Object} [config] Configuration settings for the new table:
   *  - data: The data payload to use.
   *  - filter: An additional filter bitset to apply.
   *  - groups: The groupby specification to use (null for no groups).
   *  - order: The orderby comparator to use (null for no order).
   * @return {Table} A newly created table.
   */
  create({ data, filter, groups, order }) { // eslint-disable-line no-unused-vars
  }

  /**
   * Create a new fully-materialized instance of this table.
   * All filter and orderby settings are removed from the new table.
   * Instead, the backing data itself is filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {Table} A reified table.
   */
  reify(indices) { // eslint-disable-line no-unused-vars
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
   * @return {*} The table value at (column, row).
   */
  get(name, row) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Options for generating row objects.
   * @typedef {Object} ObjectsOptions
   * @property {number} [limit=Infinity] The maximum number of objects to create.
   */

  /**
   * Returns an array of objects representing table rows.
   * @param {ObjectsOptions} [options] The options for row object generation.
   * @return {Array} An array of row objects.
   */
  objects(options) { // eslint-disable-line no-unused-vars
    error('Not implemented');
  }

  /**
   * Print the contents of this table using the console.table() method.
   * @param {ObjectsOptions} options The options for row object generation,
   *  determining which rows and columns are printed.
   */
  print(options = {}) {
    if (typeof options === 'number') {
      options = { limit: 10 };
    } else if (options.limit == null) {
      options.limit = 10;
    }

    const show = numRows(this, options.limit);
    const msg = `${this[Symbol.toStringTag]}. Showing ${show} rows.`;
    const obj = this.objects(options);

    console.log(msg);   // eslint-disable-line no-console
    console.table(obj); // eslint-disable-line no-console
  }

  /**
   * Returns an array of indices for all rows passing the table filter.
   * @param {boolean} [ordered=false] A flag indicating if the returned
   *  indices should be sorted. Only applies if the table is ordered.
   * @return {Uint32Array} An array of row indices.
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
   * If the table is not grouped, the results is the same as
   * {@link indices}, but wrapped within an array.
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
   * Callback function invoked for each row of a table scan.
   * @callback scanVisitor
   * @param {number} row The table row index.
   * @param {Object|Array} data The backing table data store.
   * @param {Function} stop Function to stop the scan early.
   *  Callees can invoke this function to prevent future calls.
   */

  /**
   * Perform a table scan, visiting each row of the table.
   * If this table is filtered, only rows passing the filter are visited.
   * @param {scanVisitor} fn Callback invoked for each row of the table.
   * @param {boolean} [ordered=false] Indicates if the table should be
   *  scanned in the order determined by {@link Table#orderby}. Has no
   *  effect if this table is unordered.
   */
  scan(fn, ordered) {
    const filter = this._filter;
    const nrows = this._nrows;
    const data = this._data;

    let i = 0;
    const stop = () => i = this._total;

    if (ordered && this.isOrdered() || filter && this._index) {
      const index = this._index = this.indices(true);
      const data = this._data;
      for (; i < nrows; ++i) {
        fn(index[i], data, stop);
      }
    } else if (filter) {
      for (i = filter.next(0); i >= 0; i = filter.next(i + 1)) {
        fn(i, data, stop);
      }
    } else {
      for (; i < nrows; ++i) {
        fn(i, data, stop);
      }
    }
  }

  // -- Transformation Verbs ------------------------------------------------

  /**
   * Options for count transformations.
   * @typedef {Object} CountOptions
   * @property {string} [as='count'] The name of the output count column.
   */

  /**
   * Count the number of values in a group. This method is a shorthand
   * for {@link Table#rollup} with a count aggregate function.
   * @param {CountOptions} [options] Options for the count.
   * @return {Table} A new table with groupby and count columns.
   * @example table.groupby('colA').count()
   * @example table.groupby('colA').count({ as: 'num' })
   */
  count(options) {
    const as = options && options.as || 'count';
    return this.rollup({ [as]: '() => count()' });
  }

  /**
   * De-duplicate table rows by removing repeated row values.
   * @param  {...any} [keys] Key columns to check for duplicates.
   *  Two rows are considered duplicates if they have matching values
   *  for all keys. If keys are unspecified, all columns are used.
   *  Keys may be column name strings, column index numbers, or value
   *  objects with output column names for keys and table expressions
   *  for values.
   * @return {Table} A new de-duplicated table.
   * @example table.dedupe()
   * @example table.dedupe('a', 'b')
   * @example table.dedupe({ abs: d => op.abs(d.a) })
   */
  dedupe(...keys) {
    return this.__dedupe(this, keys.flat());
  }

  /**
   * Derive new column values based on the provided expressions.
   * @param {Object} values Object of name-value pairs defining the
   *  columns to derive. The input object should have output column
   *  names for keys and table expressions for values.
   * @return {Table} A new table with derived columns added.
   * @example table.derive({ sumXY: d => d.x + d.y })
   */
  derive(values) {
    return this.__derive(this, values);
  }

  /**
   * Filter a table to a subset of rows based on the input criteria.
   * The resulting table provides a filtered view over the original data;
   * no data copy is made. To create a table that copies only filtered data
   * to new data structures, call {@link Table#reify} on the output table.
   * @param {Function} criteria The filter criteria as a table expression.
   *  Both aggregate and window functions are permitted, and will take into
   *  account any {@link Table#groupby} or {@link Table#orderby} settings.
   * @return {Table} A new table with filtered rows.
   * @example table.filter(d => abs(d.value) < 5)
   */
  filter(criteria) {
    return this.__filter(this, criteria);
  }

  /**
   * Group table rows based on a set of column values.
   * Subsequent operations that are sensitive to grouping (such as
   * aggregate functions) will operate over the grouped rows.
   * To undo grouping, use {@link Table#ungroup}.
   * @param  {...any} keys Key column values to group by.
   *  Keys may be column name strings, column index numbers, or value
   *  objects with output column names for keys and table expressions
   *  for values.
   * @return {Table} A new table with grouped rows.
   * @example table.groupby('colA', 'colB')
   * @example table.groupby({ key: d => d.colA + d.colB })
   */
  groupby(...keys) {
    return this.__groupby(this, keys.flat());
  }

  /**
   * Order table rows based on a set of column values.
   * Subsequent operations sensitive to ordering (such as window functions)
   * will operate over sorted values.
   * The resulting table provides an view over the original data, without
   * any copying. To create a table with sorted data copied to new data
   * strucures, call {@link Table#reify} on the result of this method.
   * To undo ordering, use {@link Table#unorder}.
   * @param  {...any} keys Key values to sort by, in precedence order.
   *  By default, sorting is done in ascending order.
   *  To sort in descending order, wrap values using {@link desc}.
   *  If a string, order by the column with that name.
   *  If a number, order by the column with that index.
   *  If a function, must be a valid table expression; aggregate functions
   *  are permitted, but window functions are not.
   *  If an object, object values must be valid values parameters
   *  with output column names for keys and table expressions
   *  for values (the output names will be ignored).
   *  If an array, array values must be valid key parameters.
   * @return {Table} A new ordered table.
   * @example table.orderby('a', desc('b'))
   * @example table.orderby({ a: 'a', b: desc('b') )})
   * @example table.orderby(desc(d => d.a))
   */
  orderby(...keys) {
    return this.__orderby(this, keys.flat());
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
   * Rollup a table to produce an aggregate summary.
   * Often used in conjunction with {@link Table#groupby}.
   * To produce counts only, {@link Table#count} is a convenient shortcut.
   * @param {Object} values Object of name-value pairs defining aggregated
   *  output columns. The input object should have output column
   *  names for keys and table expressions for values.
   * @return {Table} A new table of aggregate summary values.
   * @example table.groupby('colA').rollup({ mean: d => mean(d.colB) })
   * @example table.groupby('colA').rollup({ mean: op.median('colB') })
   */
  rollup(values) {
    return this.__rollup(this, values);
  }

  /**
   * Options for sample transformations.
   * @typedef {Object} SampleOptions
   * @property {boolean} [replace=false] Flag for sampling with replacement.
   * @property {Function|string} [weight] Column values to use as weights
   *  for sampling. Rows will be sampled with probability proportional to
   *  their relative weight. The input should be a column name string or
   *  a table expression.
   */

  /**
   * Generate a table from a random sample of rows.
   * @param {number} size The number of samples to draw.
   * @param {SampleOptions} options Options for sampling.
   * @return {Table} A new table with sampled rows.
   * @example table.sample(50)
   * @example table.sample(100, { replace: true })
   */
  sample(size, options) {
    return this.__sample(this, size, options);
  }

  /**
   * Select a subset of columns into a new table, potentially renaming them.
   * @param {string|string[]|Object|Function} columns The columns to select.
   *  The input may consist of:
   *  - column name strings,
   *  - column integer indices,
   *  - objects with current column names as keys and new column names as
   *    values (for renaming), or
   *  - functions that take a table as input and returns a valid selection
   *    parameter (typically the output of the selection helper functions
   *    {@link all}, {@link not}, or {@link range}).
   * @return {Table} A new table of selected columns.
   * @example table.select('colA', 'colB')
   * @example table.select(not('colB', 'colC'))
   * @example table.select({ colA: 'newA', colB: 'newB' })
   */
  select(...columns) {
    return this.__select(this, columns.flat());
  }

  /**
   * Ungroup a table, removing any grouping criteria.
   * Undoes the effects of {@link Table#groupby}.
   * @return {Table} A new ungrouped table, or this table if not grouped.
   * @example table.ungroup()
   */
  ungroup() {
    return this.__ungroup(this);
  }

  /**
   * Unorder a table, removing any sorting criteria.
   * Undoes the effects of {@link Table#orderby}.
   * @return {Table} A new unordered table, or this table if not ordered.
   * @example table.unorder()
   */
  unorder() {
    return this.__unorder(this);
  }

  // -- Reshaping Verbs -----------------------------------------------------

  /**
   * Options for fold transformations.
   * @typedef {Object} FoldOptions
   * @property {string[]} [as=['key', 'value']] An array indicating the
   *  output column names to use for the key and value columns, respectively.
   */

  /**
   * Fold one or more columns into two key-value pair columns.
   * The fold transform is an inverse of the {@link Table#pivot} transform.
   * The resulting table has two new columns, one containing the column
   * names (named "key") and the other the column values (named "value").
   * The number of output rows equals the original row count multiplied
   * by the number of folded columns.
   * @param {*} values The columns to fold. The input may consist of an array
   *  with column name strings, objects with output names as keys and current
   *  names as values (output names will be ignored), or the output of the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   * @param {FoldOptions} options Options for folding.
   * @return {Table} A new folded table.
   * @example table.fold('colA')
   * @example table.fold(['colA', 'colB'])
   * @example table.fold(range(5, 8))
   */
  fold(values, options) {
    return this.__fold(this, values, options);
  }

  /**
   * Options for pivot transformations.
   * @typedef {Object} PivotOptions
   * @property {number} [limit=Infinity] The maximum number of new columns to generate.
   * @property {string} [keySeparator='_'] A string to place between multiple key names.
   * @property {string} [valueSeparator='_'] A string to place between key and value names.
   * @property {boolean} [sort=true] Flag for alphabetical sorting of new column names.
   */

  /**
   * Pivot columns into a cross-tabulation.
   * The pivot transform is an inverse of the {@link Table#fold} transform.
   * The resulting table has new columns for each unique combination
   * of the provided *keys*, populated with the provided *values*.
   * The provided *values* must be aggregates, as a single set of keys may
   * include more than one row. If string-valued, the *any* aggregate is used.
   * If only one *values* column is defined, the new pivoted columns will
   * be named using key values directly. Otherwise, input value column names
   * will be included as a component of the output column names.
   * @param {*} keys Key values to map to new column names. Keys may be an
   *  array of column name strings, column index numbers, or value objects
   *  with output column names for keys and table expressions for values.
   * @param {string|string[]|Object} values Output values for pivoted columns.
   *  Column string names will be wrapped in any *any* aggregate.
   *  If object-valued, the input object should have output value
   *  names for keys and table expressions for values.
   * @param {PivotOptions} options Options for pivoting.
   * @return {Table} A new pivoted table.
   * @example table.pivot('key', 'value')
   * @example table.pivot(['keyA', 'keyB'], ['valueA', 'valueB'])
   * @example table.pivot({ key: d => d.key }, { value: d => sum(d.value) })
   */
  pivot(keys, values, options) {
    return this.__pivot(this, keys, values, options);
  }

  /**
   * Options for spread transformations.
   * @typedef {Object} SpreadOptions
   * @property {number} [limit=Infinity] The maximum number of new columns to generate.
   */

  /**
   * Spread array elements into a set of new columns.
   * Output columns are named based on the value key and array index.
   * @param {string|Array|Object} values The columns to spread, as either
   *  an array of column names or a key-value object of table expressions.
   * @param {SpreadOptions} [options] Options for spreading.
   * @return {Table} A new table with the spread columns added.
   * @example table.spread({ a: split(d.text, '') })
   * @example table.spread('arrayCol', { limit: 100 })
   */
  spread(values, options) {
    return this.__spread(this, values, options);
  }

  /**
   * Options for unroll transformations.
   * @typedef {Object} UnrollOptions
   * @property {number} [limit=Infinity] The maximum number of new rows to generate.
   */

  /**
   * Unroll one or more array-valued columns into new rows.
   * If more than one array value is used, the number of new rows
   * is the smaller of the limit and the largest length.
   * Values for all other columns are copied over.
   * @param {string|Array|Object} values The columns to unroll, as either
   *  an array of column names or a key-value object of table expressions.
   * @param {UnrollOptions} [options] Options for unrolling.
   * @return {Table} A new unrolled table.
   * @example table.unroll('colA', { limit: 1000 })
   */
  unroll(values, options) {
    return this.__unroll(this, values, options);
  }

  // -- Joins ---------------------------------------------------------------

  /**
   * Lookup values from a secondary table and add them as new columns.
   * A lookup occurs upon matching key values for rows in both tables.
   * If the secondary table has multiple rows with the same key, only
   * the last observed instance will be considered in the lookup.
   * Lookup is similar to {@link Table#join_left}, but with a streamlined
   * syntax and the added constraint of allowing at most one match only.
   * @param {Table} other The secondary table to look up values from.
   * @param {Array} on A two-element array of lookup keys (column name
   *  strings or table expressions) for this table and the secondary table,
   *  respectively.
   * @param {string|Object} values The column values to add from the
   *  secondary table. Can be column name strings or objects with column
   *  names as keys and table expressions as values.
   * @return {Table} A new table with lookup values added.
   * @example table.lookup(other, ['key1', 'key2'], 'value1', 'value2')
   */
  lookup(other, on, ...values) {
    return this.__lookup(this, other, on, values.flat());
  }

  /**
   * Options for join transformations.
   * @typedef {Object} JoinOptions
   * @property {boolean} [left=false] Flag indicating a left outer join.
   *  If both the *left* and *right* are true, indicates a full outer join.
   * @property {boolean} [right=false] Flag indicating a right outer join.
   *  If both the *left* and *right* are true, indicates a full outer join.
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
   *  are compared.
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
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
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
   * This is a convenience method with fixed options for {@link Table#join}.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
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
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
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
   * This is a convenience method with fixed options for {@link Table#join}.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
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
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
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
   * This is a convenience method with fixed options for {@link Table#join}.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
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
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: true, right: true}.
   * @return {Table} A new joined table.
   * @example table.join_full(other, ['keyL', 'keyR'])
   * @example table.join_full(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_full(other, on, values, options) {
    const opt = { ...options, left: true, right: true };
    return this.__join(this, other, on, values, opt);
  }

  /**
   * Produce the Cartesian cross product of two tables. The output table
   * has one row for every pair of input table rows. Beware that outputs
   * may be quite large, as the number of output rows is the product of
   * the input row counts.
   * This is a convenience method for {@link Table#join} in which the
   * join criteria is always true.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Object} [values] The columns to include in the output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join.
   * @return {Table} A new joined table.
   * @example table.cross(other)
   * @example table.cross(other, [['leftKey', 'leftVal'], ['rightVal']])
   */
  cross(other, values, options) {
    const opt = { ...options, left: true, right: true };
    return this.__join(this, other, () => true, values, opt);
  }

  /**
   * Perform a semi-join, filtering the left table to only rows that
   * match a row in the right table.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @return {Table} A new filtered table.
   * @example table.semijoin(other)
   * @example table.semijoin(other, ['keyL', 'keyR'])
   * @example table.semijoin(other, (a, b) => equal(a.keyL, b.keyR))
   */
  semijoin(other, on) {
    return this.__join_filter(this, other, on);
  }

  /**
   * Perform an anti-join, filtering the left table to only rows that
   * do *not* match a row in the right table.
   * @param {Table} other The other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @return {Table} A new filtered table.
   * @example table.antijoin(other)
   * @example table.antijoin(other, ['keyL', 'keyR'])
   * @example table.antijoin(other, (a, b) => equal(a.keyL, b.keyR))
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
   * @example table.concat(other)
   * @example table.concat(other1, other2)
   * @example table.concat([other1, other2])
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
   * @example table.union(other)
   * @example table.union(other1, other2)
   * @example table.union([other1, other2])
   */
  union(...tables) {
    return this.__union(this, tables.flat());
  }

  /**
   * Intersect multiple tables, keeping only rows whose with identical
   * values for all columns in all tables, and deduplicates the rows.
   * This transformation is similar to a series of {@link Table#semijoin}
   * calls, but additionally suppresses duplicate rows.
   * @see Table#semijoin
   * @param  {...any} tables A list of tables to intersect.
   * @return {Table} A new filtered table.
   * @example table.intersect(other)
   * @example table.intersect(other1, other2)
   * @example table.intersect([other1, other2])
   */
  intersect(...tables) {
    return this.__intersect(this, tables.flat());
  }

  /**
   * Compute the set difference with multiple tables, keeping only rows in
   * this table that whose values do not occur in the other tables.
   * This transformation is similar to a series of {@link Table#antijoin}
   * calls, but additionally suppresses duplicate rows.
   * @see Table#antijoin
   * @param  {...any} tables A list of tables to difference.
   * @return {Table} A new filtered table.
   * @example table.except(other)
   * @example table.except(other1, other2)
   * @example table.except([other1, other2])
   */
  except(...tables) {
    return this.__except(this, tables.flat());
  }
}
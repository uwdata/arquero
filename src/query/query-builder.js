import Query from '../query/query';
import { Verb, Verbs } from '../query/verb';
import toArray from '../util/to-array';

/**
 * Create a new query builder instance. The query builder provides
 * a table-like verb API to construct a query that can be
 * serialized or evaluated against Arquero tables.
 * @param {string} [tableName] The name of the table to query. If
 *  provided, will be used as the default input table to pull from
 *  a provided catalog to run the query against.
 * @return {QueryBuilder} A new query builder instance.
 */
export function query(tableName) {
  return new QueryBuilder(tableName);
}

/**
 * Create a new query builder instance from a serialized object.
 * @param {object} object A serialized query representation, such as
 *  those generated by query(...).toObject().
 * @returns {QueryBuilder} The instantiated query builder.
 */
export function queryFrom(object) {
  return QueryBuilder.from(object);
}

/**
 * Table-like interface for constructing queries.
 */
export default class QueryBuilder extends Query {

  /**
   * Construct a new query builder instance.
   */
  constructor(source, verbs, params) {
    super(verbs, params, source);
  }

  /**
   * Create a new query builder instance from a serialized object.
   * @param {object} object A serialized query representation, such as
   *  those generated by QueryBuilder.toObject().
   * @returns {QueryBuilder} The instantiated query builder.
   */
  static from({ verbs, table, params }) {
    return new QueryBuilder(
      table,
      verbs.map(Verb.from),
      params
    );
  }

  /**
   * Provide an informative object string tag.
   */
  get [Symbol.toStringTag]() {
    if (!this._verbs) return 'Object'; // bail if called on prototype
    const ns = this._verbs.length;
    return `QueryBuilder: ${ns} verbs`
      + (this._table ? ` on '${this._table}'` : '');
  }

  /**
   * Append a verb to the current query and return a new query builder.
   * @param {Verb} verb The verb to append to the query.
   * @return {QueryBuilder} A new QueryBuilder with appended verb.
   */
  append(verb) {
    return new QueryBuilder(
      this._table,
      this._verbs.concat(verb),
      this._params
    );
  }

  // -- Transformation Verbs ------------------------------------------------

  /**
   * Fully materialize an instance of a table.
   * All filter and orderby settings are removed from the new table.
   * Instead, the backing data itself is filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {QueryBuilder} A new builder with "reify" verb appended.
   */
  reify() {
    return this.append(Verbs.reify());
  }

  /**
   * Options for count transformations.
   * @typedef {Object} CountOptions
   * @property {string} [as='count'] The name of the output count column.
   */

  /**
   * Count the number of values in a group. This method is a shorthand
   * for {@link QueryBuilder#rollup} with a count aggregate function.
   * @param {CountOptions} [options] Options for the count.
   * @return {QueryBuilder} A new builder with "count" verb appended.
   * @example query.groupby('colA').count()
   * @example query.groupby('colA').count({ as: 'num' })
   */
  count(options) {
    return this.append(Verbs.count(options));
  }

  /**
   * De-duplicate table rows by removing repeated row values.
   * @param  {...any} [keys] Key columns to check for duplicates.
   *  Two rows are considered duplicates if they have matching values
   *  for all keys. If keys are unspecified, all columns are used.
   *  Keys may be column name strings, column index numbers, or value
   *  objects with output column names for keys and table expressions
   *  for values.
   * @return {QueryBuilder} A new builder with "dedupe" verb appended.
   * @example query.dedupe()
   * @example query.dedupe('a', 'b')
   * @example query.dedupe({ abs: d => op.abs(d.a) })
   */
  dedupe(...keys) {
    return this.append(Verbs.dedupe(keys.flat()));
  }

  /**
   * Options for relocate transformations.
   * @typedef {Object} DeriveOptions
   * @property {boolean} [drop=false] A flag indicating if the original
   *  columns should be dropped, leaving only the derived columns. If true,
   *  the before and after options are ignored.
   * @property {string|string[]|number|number[]|Object|Function} [before]
   *  An anchor column that relocated columns should be placed before.
   *  The value can be any legal column selection. If multiple columns are
   *  selected, only the first column will be used as an anchor.
   *  It is an error to specify both before and after options.
   * @property {string|string[]|number|number[]|Object|Function} [after]
   *  An anchor column that relocated columns should be placed after.
   *  The value can be any legal column selection. If multiple columns are
   *  selected, only the last column will be used as an anchor.
   *  It is an error to specify both before and after options.
   */

  /**
   * Derive new column values based on the provided expressions.
   * @param {Object} values Object of name-value pairs defining the
   *  columns to derive. The input object should have output column
   *  names for keys and table expressions for values.
   * @param {DeriveOptions=} options Options for dropping or relocating
   *  derived columns. Use either a before or after property to indicate
   *  where to place derived columns. Specifying both before and after is an
   *  error. Unlike the relocate verb, this option affects only new columns;
   *  updated columns with existing names are excluded from relocation.
   * @return {QueryBuilder} A new builder with "derive" verb appended.
   * @example query.derive({ sumXY: d => d.x + d.y })
   * @example query.derive({ z: d => d.x * d.y }, { before: 'x' })
   */
  derive(values, options) {
    return this.append(Verbs.derive(values, options));
  }

  /**
   * Filter a table to a subset of rows based on the input criteria.
   * The resulting table provides a filtered view over the original data;
   * no data copy is made. To create a table that copies only filtered data
   * to new data structures, call {@link QueryBuilder#reify} on the output table.
   * @param {Function|string} criteria The filter criteria as a table expression.
   *  Both aggregate and window functions are permitted, and will take into
   *  account any {@link QueryBuilder#groupby} or {@link QueryBuilder#orderby} settings.
   * @return {QueryBuilder} A new builder with "filter" verb appended.
   * @example query.filter(d => abs(d.value) < 5)
   */
  filter(criteria) {
    return this.append(Verbs.filter(criteria));
  }

  /**
   * Group table rows based on a set of column values.
   * Subsequent operations that are sensitive to grouping (such as
   * aggregate functions) will operate over the grouped rows.
   * To undo grouping, use {@link QueryBuilder#ungroup}.
   * @param  {...any} keys Key column values to group by.
   *  Keys may be column name strings, column index numbers, or value
   *  objects with output column names for keys and table expressions
   *  for values.
   * @return {QueryBuilder} A new builder with "groupby" verb appended.
   * @example query.groupby('colA', 'colB')
   * @example query.groupby({ key: d => d.colA + d.colB })
   */
  groupby(...keys) {
    return this.append(Verbs.groupby(keys.flat()));
  }

  /**
   * Order table rows based on a set of column values.
   * Subsequent operations sensitive to ordering (such as window functions)
   * will operate over sorted values.
   * The resulting table provides an view over the original data, without
   * any copying. To create a table with sorted data copied to new data
   * strucures, call {@link QueryBuilder#reify} on the result of this method.
   * To undo ordering, use {@link QueryBuilder#unorder}.
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
   * @return {QueryBuilder} A new builder with "orderby" verb appended.
   * @example query.orderby('a', desc('b'))
   * @example query.orderby({ a: 'a', b: desc('b') )})
   * @example query.orderby(desc(d => d.a))
   */
  orderby(...keys) {
    return this.append(Verbs.orderby(keys.flat()));
  }

  /**
   * Options for relocate transformations.
   * @typedef {Object} RelocateOptions
   * @property {string|string[]|number|number[]|Object|Function} [before]
   *  An anchor column that relocated columns should be placed before.
   *  The value can be any legal column selection. If multiple columns are
   *  selected, only the first column will be used as an anchor.
   *  It is an error to specify both before and after options.
   * @property {string|string[]|number|number[]|Object|Function} [after]
   *  An anchor column that relocated columns should be placed after.
   *  The value can be any legal column selection. If multiple columns are
   *  selected, only the last column will be used as an anchor.
   *  It is an error to specify both before and after options.
   */

  /**
   * Relocate a subset of columns to change their positions, also
   * potentially renaming them.
   * @param {string|string[]|number|number[]|Object|Function} columns An
   * ordered selection of columns to relocate. The input may consist of:
   *  - column name strings,
   *  - column integer indices,
   *  - objects with current column names as keys and new column names as
   *    values (for renaming), or
   *  - functions that take a table as input and returns a valid selection
   *    parameter (typically the output of the selection helper functions
   *    {@link all}, {@link not}, or {@link range}).
   * @param {RelocateOptions} options Options for relocating. Must include
   *  either the before or after property to indicate where to place the
   *  relocated columns. Specifying both before and after is an error.
   * @return {QueryBuilder} A new builder with "relocate" verb appended.
   * @example query.relocate(['colY', 'colZ'], { after: 'colX' })
   * @example query.relocate(not('colB', 'colC'), { before: 'colA' })
   * @example query.relocate({ colA: 'newA', colB: 'newB' }, { after: 'colC' })
   */
  relocate(columns, options) {
    return this.append(Verbs.relocate(toArray(columns), options));
  }

  /**
   * Rollup a table to produce an aggregate summary.
   * Often used in conjunction with {@link QueryBuilder#groupby}.
   * To produce counts only, {@link QueryBuilder#count} is a convenient shortcut.
   * @param {Object} values Object of name-value pairs defining aggregated
   *  output columns. The input object should have output column
   *  names for keys and table expressions for values.
   * @return {QueryBuilder} A new builder with "rollup" verb appended.
   * @example query.groupby('colA').rollup({ mean: d => mean(d.colB) })
   * @example query.groupby('colA').rollup({ mean: op.median('colB') })
   */
  rollup(values) {
    return this.append(Verbs.rollup(values));
  }

  /**
   * Options for sample transformations.
   * @typedef {Object} SampleOptions
   * @property {boolean} [replace=false] Flag for sampling with replacement.
   * @property {Function|string} [weight] Column values to use as weights
   *  for sampling. Rows will be sampled with probability proportional to
   *  their relative weight. The input should be a column name string or
   *  a table expression compatible with {@link QueryBuilder#derive}.
   */

  /**
   * Generate a table from a random sample of rows.
   * If the table is grouped, performs a stratified sample by
   * sampling from each group separately.
   * @param {number|Function} size The number of samples to draw per group.
   *  If number-valued, the same sample size is used for each group.
   *  If function-valued, the input should be an aggregate table
   *  expression compatible with {@link QueryBuilder#rollup}.
   * @param {SampleOptions=} options Options for sampling.
   * @return {QueryBuilder} A new builder with "sample" verb appended.
   * @example query.sample(50)
   * @example query.sample(100, { replace: true })
   * @example query.groupby('colA').sample(() => op.floor(0.5 * op.count()))
   */
  sample(size, options) {
    return this.append(Verbs.sample(size, options));
  }

  /**
   * Select a subset of columns into a new table, potentially renaming them.
   * @param {string|string[]|number|number[]|Object|Function} columns The columns to select.
   *  The input may consist of:
   *  - column name strings,
   *  - column integer indices,
   *  - objects with current column names as keys and new column names as
   *    values (for renaming), or
   *  - functions that take a table as input and returns a valid selection
   *    parameter (typically the output of the selection helper functions
   *    {@link all}, {@link not}, or {@link range}).
   * @return {QueryBuilder} A new builder with "select" verb appended.
   * @example query.select('colA', 'colB')
   * @example query.select(not('colB', 'colC'))
   * @example query.select({ colA: 'newA', colB: 'newB' })
   */
  select(...columns) {
    return this.append(Verbs.select(columns.flat()));
  }

  /**
   * Ungroup a table, removing any grouping criteria.
   * Undoes the effects of {@link QueryBuilder#groupby}.
   * @return {QueryBuilder} A new builder with "ungroup" verb appended.
   * @example query.ungroup()
   */
  ungroup() {
    return this.append(Verbs.ungroup());
  }

  /**
   * Unorder a table, removing any sorting criteria.
   * Undoes the effects of {@link QueryBuilder#orderby}.
   * @return {QueryBuilder} A new builder with "unorder" verb appended.
   * @example query.unorder()
   */
  unorder() {
    return this.append(Verbs.unorder());
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
   * The fold transform is an inverse of the {@link QueryBuilder#pivot} transform.
   * The resulting table has two new columns, one containing the column
   * names (named "key") and the other the column values (named "value").
   * The number of output rows equals the original row count multiplied
   * by the number of folded columns.
   * @param {*} values The columns to fold. The input may consist of an array
   *  with column name strings, objects with output names as keys and current
   *  names as values (output names will be ignored), or the output of the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   * @param {FoldOptions=} options Options for folding.
   * @return {QueryBuilder} A new builder with "fold" verb appended.
   * @example query.fold('colA')
   * @example query.fold(['colA', 'colB'])
   * @example query.fold(range(5, 8))
   */
  fold(values, options) {
    return this.append(Verbs.fold(values, options));
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
   * The pivot transform is an inverse of the {@link QueryBuilder#fold} transform.
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
   * @param {PivotOptions=} options Options for pivoting.
   * @return {QueryBuilder} A new builder with "pivot" verb appended.
   * @example query.pivot('key', 'value')
   * @example query.pivot(['keyA', 'keyB'], ['valueA', 'valueB'])
   * @example query.pivot({ key: d => d.key }, { value: d => sum(d.value) })
   */
  pivot(keys, values, options) {
    return this.append(Verbs.pivot(keys, values, options));
  }

  /**
   * Options for spread transformations.
   * @typedef {Object} SpreadOptions
   * @property {number} [limit=Infinity] The maximum number of new columns to generate.
   * @property {string[]} [as] Output column names to use. This option only
   *  applies when a single column is spread. If the given array of names is
   *  shorter than the number of generated columns, the additional columns
   *  will be named using the standard naming convention.
   */

  /**
   * Spread array elements into a set of new columns.
   * Output columns are named based on the value key and array index.
   * @param {string|Array|Object} values The columns to spread, as either
   *  an array of column names or a key-value object of table expressions.
   * @param {SpreadOptions=} [options] Options for spreading.
   * @return {QueryBuilder} A new builder with "spread" verb appended.
   * @example query.spread({ a: split(d.text, '') })
   * @example query.spread('arrayCol', { limit: 100 })
   */
  spread(values, options) {
    return this.append(Verbs.spread(values, options));
  }

  /**
   * Options for unroll transformations.
   * @typedef {Object} UnrollOptions
   * @property {number} [limit=Infinity] The maximum number of new rows
   *  to generate per array value.
   * @property {boolean|string} [index=false] Flag or column name for adding
   *  zero-based array index values as an output column. If true, a new column
   *  named "index" will be included. If string-valued, a new column with
   *  the given name will be added.
   * @property {string|string[]|number|number[]|Object|Function} [drop]
   *  A selection of columns to drop (exclude) from the unrolled output.
   *  The input may consist of:
   *  - column name strings,
   *  - column integer indices,
   *  - objects with column names as keys,
   *  - functions that take a table as input and returns a valid selection
   *    parameter (typically the output of the selection helper functions
   *    {@link all}, {@link not}, or {@link range}).
   */

  /**
   * Unroll one or more array-valued columns into new rows.
   * If more than one array value is used, the number of new rows
   * is the smaller of the limit and the largest length.
   * Values for all other columns are copied over.
   * @param {string|Array|Object} values The columns to unroll, as either
   *  an array of column names or a key-value object of table expressions.
   * @param {UnrollOptions} [options] Options for unrolling.
   * @return {QueryBuilder} A new builder with "unroll" verb appended.
   * @example query.unroll('colA', { limit: 1000 })
   */
  unroll(values, options) {
    return this.append(Verbs.unroll(values, options));
  }

  // -- Joins ---------------------------------------------------------------

  /**
   * Lookup values from a secondary table and add them as new columns.
   * A lookup occurs upon matching key values for rows in both tables.
   * If the secondary table has multiple rows with the same key, only
   * the last observed instance will be considered in the lookup.
   * Lookup is similar to {@link QueryBuilder#join_left}, but with a streamlined
   * syntax and the added constraint of allowing at most one match only.
   * @param {string} other The name of the secondary table to look up values from.
   * @param {Array} on A two-element array of lookup keys (column name
   *  strings or table expressions) for this table and the secondary table,
   *  respectively.
   * @param {string|Object} values The column values to add from the
   *  secondary table. Can be column name strings or objects with column
   *  names as keys and table expressions as values.
   * @return {QueryBuilder} A new builder with "lookup" verb appended.
   * @example query.lookup(other, ['key1', 'key2'], 'value1', 'value2')
   */
  lookup(other, on, ...values) {
    return this.append(Verbs.lookup(other, on, values.flat()));
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
   * the {@link QueryBuilder#join_left}, {@link QueryBuilder#join_right}, or
   * {@link QueryBuilder#join_full} methods, or provide an options argument.
   * @param {string} other The names of the other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join.
   * @return {QueryBuilder} A new builder with "join" verb appended.
   * @example query.join(other, ['keyL', 'keyR'])
   * @example query.join(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join(other, on, values, options) {
    return this.append(Verbs.join(other, on, values, options));
  }

  /**
   * Perform a left outer join on two tables. Rows in the left table
   * that do not match a row in the right table will be preserved.
   * This is a convenience method with fixed options for {@link QueryBuilder#join}.
   * @param {string} other The name of the other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: true, right: false}.
   * @return {QueryBuilder} A new builder with "join_left" verb appended.
   * @example query.join_left(other, ['keyL', 'keyR'])
   * @example query.join_left(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_left(other, on, values, options) {
    const opt = { ...options, left: true, right: false };
    return this.join(other, on, values, opt);
  }

  /**
   * Perform a right outer join on two tables. Rows in the right table
   * that do not match a row in the left table will be preserved.
   * This is a convenience method with fixed options for {@link QueryBuilder#join}.
   * @param {string} other The name of the other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: false, right: true}.
   * @return {QueryBuilder} A new builder with "join_right" verb appended.
   * @example query.join_right(other, ['keyL', 'keyR'])
   * @example query.join_right(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_right(other, on, values, options) {
    const opt = { ...options, left: false, right: true };
    return this.join(other, on, values, opt);
  }

  /**
   * Perform a full outer join on two tables. Rows in either the left or
   * right table that do not match a row in the other will be preserved.
   * This is a convenience method with fixed options for {@link QueryBuilder#join}.
   * @param {string} other The names of the other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {Array|Object} [values] The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join. With this method,
   *  any options will be overridden with {left: true, right: true}.
   * @return {QueryBuilder} A new builder with "join_full" verb appended.
   * @example query.join_full(other, ['keyL', 'keyR'])
   * @example query.join_full(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join_full(other, on, values, options) {
    const opt = { ...options, left: true, right: true };
    return this.join(other, on, values, opt);
  }

  /**
   * Produce the Cartesian cross product of two tables. The output table
   * has one row for every pair of input table rows. Beware that outputs
   * may be quite large, as the number of output rows is the product of
   * the input row counts.
   * This is a convenience method for {@link QueryBuilder#join} in which the
   * join criteria is always true.
   * @param {string} other The name of the other (right) table to join with.
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
   * @return {QueryBuilder} A new builder with "cross" verb appended.
   * @example query.cross(other)
   * @example query.cross(other, [['leftKey', 'leftVal'], ['rightVal']])
   */
  cross(other, values, options) {
    return this.append(Verbs.cross(other, values, options));
  }

  /**
   * Perform a semi-join, filtering the left table to only rows that
   * match a row in the right table.
   * @param {string} other The names of the other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @return {QueryBuilder} A new builder with "semijoin" verb appended.
   * @example query.semijoin(other)
   * @example query.semijoin(other, ['keyL', 'keyR'])
   * @example query.semijoin(other, (a, b) => equal(a.keyL, b.keyR))
   */
  semijoin(other, on) {
    return this.append(Verbs.semijoin(other, on));
  }

  /**
   * Perform an anti-join, filtering the left table to only rows that
   * do *not* match a row in the right table.
   * @param {string} other The names of the other (right) table to join with.
   * @param {Array|Function} [on] The join criteria for matching table rows.
   *  If unspecified, the values of all columns with matching names
   *  are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @return {QueryBuilder} A new builder with "antijoin" verb appended.
   * @example query.antijoin(other)
   * @example query.antijoin(other, ['keyL', 'keyR'])
   * @example query.antijoin(other, (a, b) => equal(a.keyL, b.keyR))
   */
  antijoin(other, on) {
    return this.append(Verbs.antijoin(other, on));
  }

  // -- Set Operations ------------------------------------------------------

  /**
   * Concatenate multiple tables into a single table, preserving all rows.
   * This transformation mirrors the UNION_ALL operation in SQL.
   * Only named columns in this table are included in the output.
   * @see QueryBuilder#union
   * @param  {...string} tables A list of table names to concatenate.
   * @return {QueryBuilder} A new builder with "concat" verb appended.
   * @example query.concat(other)
   * @example query.concat(other1, other2)
   * @example query.concat([other1, other2])
   */
  concat(...tables) {
    return this.append(Verbs.concat(tables.flat()));
  }

  /**
   * Union multiple tables into a single table, deduplicating all rows.
   * This transformation mirrors the UNION operation in SQL. It is
   * similar to {@link QueryBuilder#concat} but suppresses duplicate rows with
   * values identical to another row.
   * Only named columns in this table are included in the output.
   * @see QueryBuilder#concat
   * @param  {...string} tables A list of table names to union.
   * @return {QueryBuilder} A new builder with "union" verb appended.
   * @example query.union(other)
   * @example query.union(other1, other2)
   * @example query.union([other1, other2])
   */
  union(...tables) {
    return this.append(Verbs.union(tables.flat()));
  }

  /**
   * Intersect multiple tables, keeping only rows whose with identical
   * values for all columns in all tables, and deduplicates the rows.
   * This transformation is similar to a series of {@link QueryBuilder#semijoin}
   * calls, but additionally suppresses duplicate rows.
   * @see QueryBuilder#semijoin
   * @param  {...string} tables A list of table names to intersect.
   * @return {QueryBuilder} A new builder with "intersect" verb appended.
   * @example query.intersect(other)
   * @example query.intersect(other1, other2)
   * @example query.intersect([other1, other2])
   */
  intersect(...tables) {
    return this.append(Verbs.intersect(tables.flat()));
  }

  /**
   * Compute the set difference with multiple tables, keeping only rows in
   * this table that whose values do not occur in the other tables.
   * This transformation is similar to a series of {@link QueryBuilder#antijoin}
   * calls, but additionally suppresses duplicate rows.
   * @see QueryBuilder#antijoin
   * @param  {...string} tables A list of table names to difference.
   * @return {QueryBuilder} A new builder with "except" verb appended.
   * @example query.except(other)
   * @example query.except(other1, other2)
   * @example query.except([other1, other2])
   */
  except(...tables) {
    return this.append(Verbs.except(tables.flat()));
  }
}
import toArray from '../util/to-array';
import slice from '../helpers/slice';

/**
 * Abstract base class for transforming data.
 */
export default class Transformable {

  /**
   * Instantiate a new Transformable instance.
   * @param {Params} [params] The parameter values.
   */
  constructor(params) {
    if (params) this._params = params;
  }

  /**
   * Get or set table expression parameter values.
   * If called with no arguments, returns the current parameter values
   * as an object. Otherwise, adds the provided parameters to this
   * table's parameter set and returns the table. Any prior parameters
   * with names matching the input parameters are overridden.
   * @param {Params} [values] The parameter values.
   * @return {this|Params} The current parameters values (if called with
   *  no arguments) or this table.
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
   * Create a new fully-materialized instance of this table.
   * All filter and orderby settings are removed from the new table.
   * Instead, the backing data itself is filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {this} A reified table.
   */
  reify(indices) {
    return this.__reify(this, indices);
  }

  // -- Transformation Verbs ------------------------------------------------

  /**
   * Count the number of values in a group. This method is a shorthand
   * for {@link Transformable#rollup} with a count aggregate function.
   * @param {CountOptions} [options] Options for the count.
   * @return {this} A new table with groupby and count columns.
   * @example table.groupby('colA').count()
   * @example table.groupby('colA').count({ as: 'num' })
   */
  count(options) {
    return this.__count(this, options);
  }

  /**
   * Derive new column values based on the provided expressions. By default,
   * new columns are added after (higher indices than) existing columns. Use
   * the before or after options to place new columns elsewhere.
   * @param {ExprObject} values Object of name-value pairs defining the
   *  columns to derive. The input object should have output column
   *  names for keys and table expressions for values.
   * @param {DeriveOptions} [options] Options for dropping or relocating
   *  derived columns. Use either a before or after property to indicate
   *  where to place derived columns. Specifying both before and after is an
   *  error. Unlike the relocate verb, this option affects only new columns;
   *  updated columns with existing names are excluded from relocation.
   * @return {this} A new table with derived columns added.
   * @example table.derive({ sumXY: d => d.x + d.y })
   * @example table.derive({ z: d => d.x * d.y }, { before: 'x' })
   */
  derive(values, options) {
    return this.__derive(this, values, options);
  }

  /**
   * Filter a table to a subset of rows based on the input criteria.
   * The resulting table provides a filtered view over the original data; no
   * data copy is made. To create a table that copies only filtered data to
   * new data structures, call {@link Transformable#reify} on the output table.
   * @param {TableExpr} criteria Filter criteria as a table expression.
   *  Both aggregate and window functions are permitted, taking into account
   *  {@link Transformable#groupby} or {@link Transformable#orderby} settings.
   * @return {this} A new table with filtered rows.
   * @example table.filter(d => abs(d.value) < 5)
   */
  filter(criteria) {
    return this.__filter(this, criteria);
  }

  /**
   * Extract rows with indices from start to end (end not included), where
   * start and end represent per-group ordered row numbers in the table.
   * @param {number} [start] Zero-based index at which to start extraction.
   *  A negative index indicates an offset from the end of the group.
   *  If start is undefined, slice starts from the index 0.
   * @param {number} [end] Zero-based index before which to end extraction.
   *  A negative index indicates an offset from the end of the group.
   *  If end is omitted, slice extracts through the end of the group.
   * @return {this} A new table with sliced rows.
   * @example table.slice(1, -1)
   */
  slice(start, end) {
    return this.filter(slice(start, end)).reify();
  }

  /**
   * Group table rows based on a set of column values.
   * Subsequent operations that are sensitive to grouping (such as
   * aggregate functions) will operate over the grouped rows.
   * To undo grouping, use {@link Transformable#ungroup}.
   * @param  {...ExprList} keys Key column values to group by.
   *  The keys may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @return {this} A new table with grouped rows.
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
   * strucures, call {@link Transformable#reify} on the result of this method.
   * To undo ordering, use {@link Transformable#unorder}.
   * @param  {...OrderKeys} keys Key values to sort by, in precedence order.
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
   * @return {this} A new ordered table.
   * @example table.orderby('a', desc('b'))
   * @example table.orderby({ a: 'a', b: desc('b') )})
   * @example table.orderby(desc(d => d.a))
   */
  orderby(...keys) {
    return this.__orderby(this, keys.flat());
  }

  /**
   * Relocate a subset of columns to change their positions, also
   * potentially renaming them.
   * @param {Selection} columns An ordered selection of columns to relocate.
   *  The input may consist of column name strings, column integer indices,
   *  rename objects with current column names as keys and new column names
   *  as values, or functions that take a table as input and returns a valid
   *  selection parameter (typically the output of selection helper functions
   *  such as {@link all}, {@link not}, or {@link range}).
   * @param {RelocateOptions} options Options for relocating. Must include
   *  either the before or after property to indicate where to place the
   *  relocated columns. Specifying both before and after is an error.
   * @return {this} A new table with relocated columns.
   * @example table.relocate(['colY', 'colZ'], { after: 'colX' })
   * @example table.relocate(not('colB', 'colC'), { before: 'colA' })
   * @example table.relocate({ colA: 'newA', colB: 'newB' }, { after: 'colC' })
   */
  relocate(columns, options) {
    return this.__relocate(this, toArray(columns), options);
  }

  /**
   * Rename one or more columns, preserving column order.
   * @param {...Select} columns One or more rename objects with current
   *  column names as keys and new column names as values.
   * @return {this} A new table with renamed columns.
   * @example table.rename({ oldName: 'newName' })
   * @example table.rename({ a: 'a2', b: 'b2' })
   */
  rename(...columns) {
    return this.__rename(this, columns.flat());
  }

  /**
   * Rollup a table to produce an aggregate summary.
   * Often used in conjunction with {@link Transformable#groupby}.
   * To produce counts only, {@link Transformable#count} is a shortcut.
   * @param {ExprObject} [values] Object of name-value pairs defining aggregate
   *  output columns. The input object should have output column names for
   *  keys and table expressions for values. The expressions must be valid
   *  aggregate expressions: window functions are not allowed and column
   *  references must be arguments to aggregate functions.
   * @return {this} A new table of aggregate summary values.
   * @example table.groupby('colA').rollup({ mean: d => mean(d.colB) })
   * @example table.groupby('colA').rollup({ mean: op.median('colB') })
   */
  rollup(values) {
    return this.__rollup(this, values);
  }

  /**
   * Generate a table from a random sample of rows.
   * If the table is grouped, performs a stratified sample by
   * sampling from each group separately.
   * @param {number|TableExpr} size The number of samples to draw per group.
   *  If number-valued, the same sample size is used for each group.
   *  If function-valued, the input should be an aggregate table
   *  expression compatible with {@link Transformable#rollup}.
   * @param {SampleOptions} [options] Options for sampling.
   * @return {this} A new table with sampled rows.
   * @example table.sample(50)
   * @example table.sample(100, { replace: true })
   * @example table.groupby('colA').sample(() => op.floor(0.5 * op.count()))
   */
  sample(size, options) {
    return this.__sample(this, size, options);
  }

  /**
   * Select a subset of columns into a new table, potentially renaming them.
   * @param {...Select} columns An ordered selection of columns.
   *  The input may consist of column name strings, column integer indices,
   *  rename objects with current column names as keys and new column names
   *  as values, or functions that take a table as input and returns a valid
   *  selection parameter (typically the output of selection helper functions
   *  such as {@link all}, {@link not}, or {@link range}).
   * @return {this} A new table of selected columns.
   * @example table.select('colA', 'colB')
   * @example table.select(not('colB', 'colC'))
   * @example table.select({ colA: 'newA', colB: 'newB' })
   */
  select(...columns) {
    return this.__select(this, columns.flat());
  }

  /**
   * Ungroup a table, removing any grouping criteria.
   * Undoes the effects of {@link Transformable#groupby}.
   * @return {this} A new ungrouped table, or this table if not grouped.
   * @example table.ungroup()
   */
  ungroup() {
    return this.__ungroup(this);
  }

  /**
   * Unorder a table, removing any sorting criteria.
   * Undoes the effects of {@link Transformable#orderby}.
   * @return {this} A new unordered table, or this table if not ordered.
   * @example table.unorder()
   */
  unorder() {
    return this.__unorder(this);
  }

  // -- Cleaning Verbs ------------------------------------------------------

  /**
   * De-duplicate table rows by removing repeated row values.
   * @param {...ExprList} keys Key columns to check for duplicates.
   *  Two rows are considered duplicates if they have matching values for
   *  all keys. If keys are unspecified, all columns are used.
   *  The keys may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @return {this} A new de-duplicated table.
   * @example table.dedupe()
   * @example table.dedupe('a', 'b')
   * @example table.dedupe({ abs: d => op.abs(d.a) })
   */
  dedupe(...keys) {
    return this.__dedupe(this, keys.flat());
  }

  /**
   * Impute missing values or rows. Accepts a set of column-expression pairs
   * and evaluates the expressions to replace any missing (null, undefined,
   * or NaN) values in the original column.
   * If the expand option is specified, imputes new rows for missing
   * combinations of values. All combinations of key values (a full cross
   * product) are considered for each level of grouping (specified by
   * {@link Transformable#groupby}). New rows will be added for any combination
   * of key and groupby values not already contained in the table. For all
   * non-key and non-group columns the new rows are populated with imputation
   * values (first argument) if specified, otherwise undefined.
   * If the expand option is specified, any filter or orderby settings are
   * removed from the output table, but groupby settings persist.
   * @param {ExprObject} values Object of name-value pairs for the column values
   *  to impute. The input object should have existing column names for keys
   *  and table expressions for values. The expressions will be evaluated to
   *  determine replacements for any missing values.
   * @param {ImputeOptions} [options] Imputation options. The expand
   *  property specifies a set of column values to consider for imputing
   *  missing rows. All combinations of expanded values are considered, and
   *  new rows are added for each combination that does not appear in the
   *  input table.
   * @return {this} A new table with imputed values and/or rows.
   * @example table.impute({ v: () => 0 })
   * @example table.impute({ v: d => op.mean(d.v) })
   * @example table.impute({ v: () => 0 }, { expand: ['x', 'y'] })
   */
  impute(values, options) {
    return this.__impute(this, values, options);
  }

  // -- Reshaping Verbs -----------------------------------------------------

  /**
   * Fold one or more columns into two key-value pair columns.
   * The fold transform is an inverse of the {@link Transformable#pivot} transform.
   * The resulting table has two new columns, one containing the column
   * names (named "key") and the other the column values (named "value").
   * The number of output rows equals the original row count multiplied
   * by the number of folded columns.
   * @param {ExprList} values The columns to fold.
   *  The columns may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @param {FoldOptions} [options] Options for folding.
   * @return {this} A new folded table.
   * @example table.fold('colA')
   * @example table.fold(['colA', 'colB'])
   * @example table.fold(range(5, 8))
   */
  fold(values, options) {
    return this.__fold(this, values, options);
  }

  /**
   * Pivot columns into a cross-tabulation.
   * The pivot transform is an inverse of the {@link Transformable#fold} transform.
   * The resulting table has new columns for each unique combination
   * of the provided *keys*, populated with the provided *values*.
   * The provided *values* must be aggregates, as a single set of keys may
   * include more than one row. If string-valued, the *any* aggregate is used.
   * If only one *values* column is defined, the new pivoted columns will
   * be named using key values directly. Otherwise, input value column names
   * will be included as a component of the output column names.
   * @param {ExprList} keys Key values to map to new column names.
   *  The keys may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @param {ExprList} values Output values for pivoted columns.
   *  Column references will be wrapped in an *any* aggregate.
   *  If object-valued, the input object should have output value
   *  names for keys and aggregate table expressions for values.
   * @param {PivotOptions} [options] Options for pivoting.
   * @return {this} A new pivoted table.
   * @example table.pivot('key', 'value')
   * @example table.pivot(['keyA', 'keyB'], ['valueA', 'valueB'])
   * @example table.pivot({ key: d => d.key }, { value: d => sum(d.value) })
   */
  pivot(keys, values, options) {
    return this.__pivot(this, keys, values, options);
  }

  /**
   * Spread array elements into a set of new columns.
   * Output columns are named based on the value key and array index.
   * @param {ExprList} values The column values to spread.
   *  The values may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @param {SpreadOptions} [options] Options for spreading.
   * @return {this} A new table with the spread columns added.
   * @example table.spread({ a: split(d.text, '') })
   * @example table.spread('arrayCol', { limit: 100 })
   */
  spread(values, options) {
    return this.__spread(this, values, options);
  }

  /**
   * Unroll one or more array-valued columns into new rows.
   * If more than one array value is used, the number of new rows
   * is the smaller of the limit and the largest length.
   * Values for all other columns are copied over.
   * @param {ExprList} values The column values to unroll.
   *  The values may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @param {UnrollOptions} [options] Options for unrolling.
   * @return {this} A new unrolled table.
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
   * Lookup is similar to {@link Transformable#join_left}, but with a simpler
   * syntax and the added constraint of allowing at most one match only.
   * @param {TableRef} other The secondary table to look up values from.
   * @param {JoinKeys} [on] Lookup keys (column name strings or table
   *  expressions) for this table and the secondary table, respectively.
   * @param {...ExprList} values The column values to add from the
   *  secondary table. Can be column name strings or objects with column
   *  names as keys and table expressions as values.
   * @return {this} A new table with lookup values added.
   * @example table.lookup(other, ['key1', 'key2'], 'value1', 'value2')
   */
  lookup(other, on, ...values) {
    return this.__lookup(this, other, on, values.flat());
  }

  /**
   * Join two tables, extending the columns of one table with
   * values from the other table. The current table is considered
   * the "left" table in the join, and the new table input is
   * considered the "right" table in the join. By default an inner
   * join is performed, removing all rows that do not match the
   * join criteria. To perform left, right, or full outer joins, use
   * the {@link Transformable#join_left}, {@link Transformable#join_right}, or
   * {@link Transformable#join_full} methods, or provide an options argument.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinPredicate} [on] The join criteria for matching table rows.
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
   * @param {JoinValues} [values] The columns to include in the join output.
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
   * @return {this} A new joined table.
   * @example table.join(other, ['keyL', 'keyR'])
   * @example table.join(other, (a, b) => equal(a.keyL, b.keyR))
   */
  join(other, on, values, options) {
    return this.__join(this, other, on, values, options);
  }

  /**
   * Perform a left outer join on two tables. Rows in the left table
   * that do not match a row in the right table will be preserved.
   * This is a convenience method with fixed options for {@link Transformable#join}.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinPredicate} [on] The join criteria for matching table rows.
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
   * @param {JoinValues} [values] The columns to include in the join output.
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
   * @return {this} A new joined table.
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
   * This is a convenience method with fixed options for {@link Transformable#join}.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinPredicate} [on] The join criteria for matching table rows.
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
   * @param {JoinValues} [values] The columns to include in the join output.
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
   * @return {this} A new joined table.
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
   * This is a convenience method with fixed options for {@link Transformable#join}.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinPredicate} [on] The join criteria for matching table rows.
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
   * @param {JoinValues} [values] The columns to include in the join output.
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
   * @return {this} A new joined table.
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
   * This is a convenience method for {@link Transformable#join} in which the
   * join criteria is always true.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinValues} [values] The columns to include in the output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions {@link all}, {@link not}, or {@link range}.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {JoinOptions} [options] Options for the join.
   * @return {this} A new joined table.
   * @example table.cross(other)
   * @example table.cross(other, [['leftKey', 'leftVal'], ['rightVal']])
   */
  cross(other, values, options) {
    return this.__cross(this, other, values, options);
  }

  /**
   * Perform a semi-join, filtering the left table to only rows that
   * match a row in the right table.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinPredicate} [on] The join criteria for matching table rows.
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
   * @return {this} A new filtered table.
   * @example table.semijoin(other)
   * @example table.semijoin(other, ['keyL', 'keyR'])
   * @example table.semijoin(other, (a, b) => equal(a.keyL, b.keyR))
   */
  semijoin(other, on) {
    return this.__semijoin(this, other, on);
  }

  /**
   * Perform an anti-join, filtering the left table to only rows that
   * do *not* match a row in the right table.
   * @param {TableRef} other The other (right) table to join with.
   * @param {JoinPredicate} [on] The join criteria for matching table rows.
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
   * @return {this} A new filtered table.
   * @example table.antijoin(other)
   * @example table.antijoin(other, ['keyL', 'keyR'])
   * @example table.antijoin(other, (a, b) => equal(a.keyL, b.keyR))
   */
  antijoin(other, on) {
    return this.__antijoin(this, other, on);
  }

  // -- Set Operations ------------------------------------------------------

  /**
   * Concatenate multiple tables into a single table, preserving all rows.
   * This transformation mirrors the UNION_ALL operation in SQL.
   * Only named columns in this table are included in the output.
   * @see Transformable#union
   * @param  {...TableRef} tables A list of tables to concatenate.
   * @return {this} A new concatenated table.
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
   * similar to {@link Transformable#concat} but suppresses duplicate rows with
   * values identical to another row.
   * Only named columns in this table are included in the output.
   * @see Transformable#concat
   * @param  {...TableRef} tables A list of tables to union.
   * @return {this} A new unioned table.
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
   * This transformation is similar to a series of {@link Transformable#semijoin}
   * calls, but additionally suppresses duplicate rows.
   * @see Transformable#semijoin
   * @param  {...TableRef} tables A list of tables to intersect.
   * @return {this} A new filtered table.
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
   * This transformation is similar to a series of {@link Transformable#antijoin}
   * calls, but additionally suppresses duplicate rows.
   * @see Transformable#antijoin
   * @param  {...TableRef} tables A list of tables to difference.
   * @return {this} A new filtered table.
   * @example table.except(other)
   * @example table.except(other1, other2)
   * @example table.except([other1, other2])
   */
  except(...tables) {
    return this.__except(this, tables.flat());
  }
}

// -- Parameter Types -------------------------------------------------------

/**
 * Table expression parameters.
 * @typedef {Object.<string, *>} Params
 */

/**
 * A reference to a column by string name or integer index.
 * @typedef {string|number} ColumnRef
 */

/**
 * A value that can be coerced to a string.
 * @typedef {object} Stringable
 * @property {() => string} toString String coercion method.
 */

/**
 * A table expression provided as a string or string-coercible value.
 * @typedef {string|Stringable} TableExprString
 */

/**
 * A struct object with arbitraty named properties.
 * @typedef {Object.<string, *>} Struct
 */

/**
 * A function defined over a table row.
 * @typedef {(d?: Struct, $?: Params) => any} TableExprFunc
 */

/**
 * A table expression defined over a single table.
 * @typedef {TableExprFunc|TableExprString} TableExpr
 */

/**
 * A function defined over rows from two tables.
 * @typedef {(a?: Struct, b?: Struct, $?: Params) => any} TableFunc2
 */

/**
 * A table expression defined over two tables.
 * @typedef {TableExprFunc2|TableExprString} TableExpr2
 */

/**
 * An object that maps current column names to new column names.
 * @typedef {{ [name: string]: string }} RenameMap
 */

/**
 * A selection helper function.
 * @typedef {(table: any) => string[]} SelectHelper
 */

/**
 * One or more column selections, potentially with renaming.
 * The input may consist of a column name string, column integer index, a
 * rename map object with current column names as keys and new column names
 * as values, or a select helper function that takes a table as input and
 * returns a valid selection parameter.
 * @typedef {ColumnRef|RenameMap|SelectHelper} SelectEntry
 */

/**
 * An ordered set of column selections, potentially with renaming.
 * @typedef {SelectEntry|SelectEntry[]} Select
 */

/**
 * An object of column name / table expression pairs.
 * @typedef {{ [name: string]: TableExpr }} ExprObject
 */

/**
 * An object of column name / two-table expression pairs.
 * @typedef {{ [name: string]: TableExpr2 }} Expr2Object
 */

/**
 * An ordered set of one or more column values.
 * @typedef {ColumnRef|SelectHelper|ExprObject} ListEntry
 */

/**
 * An ordered set of column values.
 * Entries may be column name strings, column index numbers, value objects
 * with output column names for keys and table expressions for values,
 * or a selection helper function.
 * @typedef {ListEntry|ListEntry[]} ExprList
 */

/**
 * A reference to a data table or transformable instance.
 * @typedef {Transformable|string} TableRef
 */

/**
 * One or more orderby sort criteria.
 * If a string, order by the column with that name.
 * If a number, order by the column with that index.
 * If a function, must be a valid table expression; aggregate functions
 *  are permitted, but window functions are not.
 * If an object, object values must be valid values parameters
 *  with output column names for keys and table expressions
 *  for values. The output name keys will subsequently be ignored.
 * @typedef {ColumnRef|TableExpr|ExprObject} OrderKey
 */

/**
 * An ordered set of orderby sort criteria, in precedence order.
 * @typedef {OrderKey|OrderKey[]} OrderKeys
 */

/**
 * Column values to use as a join key.
 * @typedef {ColumnRef|TableExprFunc} JoinKey
 */

/**
 * An ordered set of join keys.
 * @typedef {JoinKey|[JoinKey[]]|[JoinKey[], JoinKey[]]} JoinKeys
 */

/**
 * A predicate specification for joining two tables.
 * @typedef {JoinKeys|TableExprFunc2|null} JoinPredicate
 */

/**
 * An array of per-table join values to extract.
 * @typedef {[ExprList]|[ExprList, ExprList]|[ExprList, ExprList, Expr2Object]} JoinList
 */

/**
 * A specification of join values to extract.
 * @typedef {JoinList|Expr2Object} JoinValues
 */

// -- Transform Options -----------------------------------------------------

/**
 * Options for count transformations.
 * @typedef {object} CountOptions
 * @property {string} [as='count'] The name of the output count column.
 */

/**
 * Options for derive transformations.
 * @typedef {object} DeriveOptions
 * @property {boolean} [drop=false] A flag indicating if the original
 *  columns should be dropped, leaving only the derived columns. If true,
 *  the before and after options are ignored.
 * @property {Select} [before]
 *  An anchor column that relocated columns should be placed before.
 *  The value can be any legal column selection. If multiple columns are
 *  selected, only the first column will be used as an anchor.
 *  It is an error to specify both before and after options.
 * @property {Select} [after]
 *  An anchor column that relocated columns should be placed after.
 *  The value can be any legal column selection. If multiple columns are
 *  selected, only the last column will be used as an anchor.
 *  It is an error to specify both before and after options.
 */

/**
 * Options for relocate transformations.
 * @typedef {object} RelocateOptions
 * @property {Selection} [before]
 *  An anchor column that relocated columns should be placed before.
 *  The value can be any legal column selection. If multiple columns are
 *  selected, only the first column will be used as an anchor.
 *  It is an error to specify both before and after options.
 * @property {Selection} [after]
 *  An anchor column that relocated columns should be placed after.
 *  The value can be any legal column selection. If multiple columns are
 *  selected, only the last column will be used as an anchor.
 *  It is an error to specify both before and after options.
 */

/**
 * Options for sample transformations.
 * @typedef {object} SampleOptions
 * @property {boolean} [replace=false] Flag for sampling with replacement.
 * @property {boolean} [shuffle=true] Flag to ensure randomly ordered rows.
 * @property {string|TableExprFunc} [weight] Column values to use as weights
 *  for sampling. Rows will be sampled with probability proportional to
 *  their relative weight. The input should be a column name string or
 *  a table expression compatible with {@link Transformable#derive}.
 */

/**
 * Options for impute transformations.
 * @typedef {object} ImputeOptions
 * @property {ExprList} [expand] Column values to combine to impute missing
 *  rows. For column names and indices, all unique column values are
 *  considered. Otherwise, each entry should be an object of name-expresion
 *  pairs, with valid table expressions for {@link Transformable#rollup}.
 *  All combinations of values are checked for each set of unique groupby
 *  values.
 */

/**
 * Options for fold transformations.
 * @typedef {object} FoldOptions
 * @property {string[]} [as=['key', 'value']] An array indicating the
 *  output column names to use for the key and value columns, respectively.
 */

/**
 * Options for pivot transformations.
 * @typedef {object} PivotOptions
 * @property {number} [limit=Infinity] The maximum number of new columns to generate.
 * @property {string} [keySeparator='_'] A string to place between multiple key names.
 * @property {string} [valueSeparator='_'] A string to place between key and value names.
 * @property {boolean} [sort=true] Flag for alphabetical sorting of new column names.
 */

/**
 * Options for spread transformations.
 * @typedef {object} SpreadOptions
 * @property {boolean} [drop=true] Flag indicating if input columns to the
 *  spread operation should be dropped in the output table.
 * @property {number} [limit=Infinity] The maximum number of new columns to
 *  generate.
 * @property {string[]} [as] Output column names to use. This option only
 *  applies when a single column is spread. If the given array of names is
 *  shorter than the number of generated columns and no limit option is
 *  specified, the additional generated columns will be dropped.
 */

/**
 * Options for unroll transformations.
 * @typedef {object} UnrollOptions
 * @property {number} [limit=Infinity] The maximum number of new rows
 *  to generate per array value.
 * @property {boolean|string} [index=false] Flag or column name for adding
 *  zero-based array index values as an output column. If true, a new column
 *  named "index" will be included. If string-valued, a new column with
 *  the given name will be added.
 * @property {Select} [drop] Columns to drop from the output. The input may
 *  consist of column name strings, column integer indices, objects with
 *  column names as keys, or functions that take a table as input and
 *  return a valid selection parameter (typically the output of selection
 *  helper functions such as {@link all}, {@link not}, or {@link range}).
 */

/**
 * Options for join transformations.
 * @typedef {object} JoinOptions
 * @property {boolean} [left=false] Flag indicating a left outer join.
 *  If both the *left* and *right* are true, indicates a full outer join.
 * @property {boolean} [right=false] Flag indicating a right outer join.
 *  If both the *left* and *right* are true, indicates a full outer join.
 * @property {string[]} [suffix=['_1', '_2']] Column name suffixes to
 *  append if two columns with the same name are produced by the join.
 */
import { Table } from './Table.js';
import {
  antijoin,
  assign,
  concat,
  cross,
  dedupe,
  derive,
  except,
  filter,
  fold,
  groupby,
  impute,
  intersect,
  join,
  lookup,
  orderby,
  pivot,
  reduce,
  relocate,
  rename,
  rollup,
  sample,
  select,
  semijoin,
  slice,
  spread,
  ungroup,
  union,
  unorder,
  unroll
} from '../verbs/index.js';
import { count } from '../op/op-api.js';
import { toArrow } from '../format/to-arrow.js';
import { toArrowIPC } from '../format/to-arrow-ipc.js';
import { toCSV } from '../format/to-csv.js';
import { toHTML } from '../format/to-html.js';
import { toJSON } from '../format/to-json.js';
import { toMarkdown } from '../format/to-markdown.js';
import { toArray } from '../util/to-array.js';

/**
 * A data table with transformation verbs.
 */
export class ColumnTable extends Table {
  /**
   * Create a new table with additional columns drawn from one or more input
   * tables. All tables must have the same numer of rows and are reified
   * prior to assignment. In the case of repeated column names, input table
   * columns overwrite existing columns.
   * @param {...(Table|import('./types.js').ColumnData)} tables
   *  The tables to merge with this table.
   * @return {this} A new table with merged columns.
   * @example table.assign(table1, table2)
   */
  assign(...tables) {
    return assign(this, ...tables);
  }

  /**
   * Count the number of values in a group. This method is a shorthand
   * for *rollup* with a count aggregate function.
   * @param {import('./types.js').CountOptions} [options]
   *  Options for the count.
   * @return {this} A new table with groupby and count columns.
   * @example table.groupby('colA').count()
   * @example table.groupby('colA').count({ as: 'num' })
   */
  count(options = {}) {
    const { as = 'count' } = options;
    return rollup(this, { [as]: count() });
  }

  /**
   * Derive new column values based on the provided expressions. By default,
   * new columns are added after (higher indices than) existing columns. Use
   * the before or after options to place new columns elsewhere.
   * @param {import('./types.js').ExprObject} values
   *  Object of name-value pairs defining the columns to derive. The input
   *  object should have output column names for keys and table expressions
   *  for values.
   * @param {import('./types.js').DeriveOptions} [options]
   *  Options for dropping or relocating derived columns. Use either a before
   *  or after property to indicate where to place derived columns. Specifying
   *  both before and after is an error. Unlike the *relocate* verb, this
   *  option affects only new columns; updated columns with existing names
   *  are excluded from relocation.
   * @return {this} A new table with derived columns added.
   * @example table.derive({ sumXY: d => d.x + d.y })
   * @example table.derive({ z: d => d.x * d.y }, { before: 'x' })
   */
  derive(values, options) {
    return derive(this, values, options);
  }

  /**
   * Filter a table to a subset of rows based on the input criteria.
   * The resulting table provides a filtered view over the original data; no
   * data copy is made. To create a table that copies only filtered data to
   * new data structures, call *reify* on the output table.
   * @param {import('./types.js').TableExpr} criteria
   *  Filter criteria as a table expression. Both aggregate and window
   *  functions are permitted, taking into account *groupby* or *orderby*
   *  settings.
   * @return {this} A new table with filtered rows.
   * @example table.filter(d => abs(d.value) < 5)
   */
  filter(criteria) {
    return filter(this, criteria);
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
    return slice(this, start, end);
  }

  /**
   * Group table rows based on a set of column values.
   * Subsequent operations that are sensitive to grouping (such as
   * aggregate functions) will operate over the grouped rows.
   * To undo grouping, use *ungroup*.
   * @param  {...import('./types.js').ExprList} keys
   *  Key column values to group by. The keys may be specified using column
   *  name strings, column index numbers, value objects with output column
   *  names for keys and table expressions for values, or selection helper
   *  functions.
   * @return {this} A new table with grouped rows.
   * @example table.groupby('colA', 'colB')
   * @example table.groupby({ key: d => d.colA + d.colB })
   */
  groupby(...keys) {
    return groupby(this, ...keys);
  }

  /**
   * Order table rows based on a set of column values. Subsequent operations
   * sensitive to ordering (such as window functions) will operate over sorted
   * values. The resulting table provides an view over the original data,
   * without any copying. To create a table with sorted data copied to new
   * data strucures, call *reify* on the result of this method. To undo
   * ordering, use *unorder*.
   * @param  {...import('./types.js').OrderKeys} keys
   *  Key values to sort by, in precedence order.
   *  By default, sorting is done in ascending order.
   *  To sort in descending order, wrap values using *desc*.
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
    return orderby(this, ...keys);
  }

  /**
   * Relocate a subset of columns to change their positions, also
   * potentially renaming them.
   * @param {import('./types.js').Select} columns
   *  An ordered selection of columns to relocate.
   *  The input may consist of column name strings, column integer indices,
   *  rename objects with current column names as keys and new column names
   *  as values, or functions that take a table as input and returns a valid
   *  selection parameter (typically the output of selection helper functions
   *  such as *all*, *not*, or *range*).
   * @param {import('./types.js').RelocateOptions} options
   *  Options for relocating. Must include either the before or after property
   *  to indicate where to place the relocated columns. Specifying both before
   *  and after is an error.
   * @return {this} A new table with relocated columns.
   * @example table.relocate(['colY', 'colZ'], { after: 'colX' })
   * @example table.relocate(not('colB', 'colC'), { before: 'colA' })
   * @example table.relocate({ colA: 'newA', colB: 'newB' }, { after: 'colC' })
   */
  relocate(columns, options) {
    return relocate(this, toArray(columns), options);
  }

  /**
   * Rename one or more columns, preserving column order.
   * @param {...import('./types.js').Select} columns
   *  One or more rename objects with current column names as keys and new
   *  column names as values.
   * @return {this} A new table with renamed columns.
   * @example table.rename({ oldName: 'newName' })
   * @example table.rename({ a: 'a2', b: 'b2' })
   */
  rename(...columns) {
    return rename(this, ...columns);
  }

  /**
   * Reduce a table, processing all rows to produce a new table.
   * To produce standard aggregate summaries, use the rollup verb.
   * This method allows the use of custom reducer implementations,
   * for example to produce multiple rows for an aggregate.
   * @param {import('../verbs/reduce/reducer.js').Reducer} reducer
   *  The reducer to apply.
   * @return {this} A new table of reducer outputs.
   */
  reduce(reducer) {
    return reduce(this, reducer);
  }

  /**
   * Rollup a table to produce an aggregate summary.
   * Often used in conjunction with *groupby*.
   * To produce counts only, *count* is a shortcut.
   * @param {import('./types.js').ExprObject} [values]
   *  Object of name-value pairs defining aggregate output columns. The input
   *  object should have output column names for keys and table expressions
   *  for values. The expressions must be valid aggregate expressions: window
   *  functions are not allowed and column references must be arguments to
   *  aggregate functions.
   * @return {this} A new table of aggregate summary values.
   * @example table.groupby('colA').rollup({ mean: d => mean(d.colB) })
   * @example table.groupby('colA').rollup({ mean: op.median('colB') })
   */
  rollup(values) {
    return rollup(this, values);
  }

  /**
   * Generate a table from a random sample of rows.
   * If the table is grouped, performs a stratified sample by
   * sampling from each group separately.
   * @param {number | import('./types.js').TableExpr} size
   *  The number of samples to draw per group.
   *  If number-valued, the same sample size is used for each group.
   *  If function-valued, the input should be an aggregate table
   *  expression compatible with *rollup*.
   * @param {import('./types.js').SampleOptions} [options]
   *  Options for sampling.
   * @return {this} A new table with sampled rows.
   * @example table.sample(50)
   * @example table.sample(100, { replace: true })
   * @example table.groupby('colA').sample(() => op.floor(0.5 * op.count()))
   */
  sample(size, options) {
    return sample(this, size, options);
  }

  /**
   * Select a subset of columns into a new table, potentially renaming them.
   * @param {...import('./types.js').Select} columns
   *  An ordered selection of columns.
   *  The input may consist of column name strings, column integer indices,
   *  rename objects with current column names as keys and new column names
   *  as values, or functions that take a table as input and returns a valid
   *  selection parameter (typically the output of selection helper functions
   *  such as *all*, *not*, or *range*.).
   * @return {this} A new table of selected columns.
   * @example table.select('colA', 'colB')
   * @example table.select(not('colB', 'colC'))
   * @example table.select({ colA: 'newA', colB: 'newB' })
   */
  select(...columns) {
    return select(this, ...columns);
  }

  /**
   * Ungroup a table, removing any grouping criteria.
   * Undoes the effects of *groupby*.
   * @return {this} A new ungrouped table, or this table if not grouped.
   * @example table.ungroup()
   */
  ungroup() {
    return ungroup(this);
  }

  /**
   * Unorder a table, removing any sorting criteria.
   * Undoes the effects of *orderby*.
   * @return {this} A new unordered table, or this table if not ordered.
   * @example table.unorder()
   */
  unorder() {
    return unorder(this);
  }

  // -- Cleaning Verbs ------------------------------------------------------

  /**
   * De-duplicate table rows by removing repeated row values.
   * @param {...import('./types.js').ExprList} keys
   *  Key columns to check for duplicates.
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
    return dedupe(this, ...keys);
  }

  /**
   * Impute missing values or rows. Accepts a set of column-expression pairs
   * and evaluates the expressions to replace any missing (null, undefined,
   * or NaN) values in the original column.
   * If the expand option is specified, imputes new rows for missing
   * combinations of values. All combinations of key values (a full cross
   * product) are considered for each level of grouping (specified by
   * *groupby*). New rows will be added for any combination
   * of key and groupby values not already contained in the table. For all
   * non-key and non-group columns the new rows are populated with imputation
   * values (first argument) if specified, otherwise undefined.
   * If the expand option is specified, any filter or orderby settings are
   * removed from the output table, but groupby settings persist.
   * @param {import('./types.js').ExprObject} values
   *  Object of name-value pairs for the column values to impute. The input
   *  object should have existing column names for keys and table expressions
   *  for values. The expressions will be evaluated to determine replacements
   *  for any missing values.
   * @param {import('./types.js').ImputeOptions} [options] Imputation options.
   *  The expand property specifies a set of column values to consider for
   *  imputing missing rows. All combinations of expanded values are
   *  considered, and new rows are added for each combination that does not
   *  appear in the input table.
   * @return {this} A new table with imputed values and/or rows.
   * @example table.impute({ v: () => 0 })
   * @example table.impute({ v: d => op.mean(d.v) })
   * @example table.impute({ v: () => 0 }, { expand: ['x', 'y'] })
   */
  impute(values, options) {
    return impute(this, values, options);
  }

  // -- Reshaping Verbs -----------------------------------------------------

  /**
   * Fold one or more columns into two key-value pair columns.
   * The fold transform is an inverse of the *pivot* transform.
   * The resulting table has two new columns, one containing the column
   * names (named "key") and the other the column values (named "value").
   * The number of output rows equals the original row count multiplied
   * by the number of folded columns.
   * @param {import('./types.js').ExprList} values The columns to fold.
   *  The columns may be specified using column name strings, column index
   *  numbers, value objects with output column names for keys and table
   *  expressions for values, or selection helper functions.
   * @param {import('./types.js').FoldOptions} [options] Options for folding.
   * @return {this} A new folded table.
   * @example table.fold('colA')
   * @example table.fold(['colA', 'colB'])
   * @example table.fold(range(5, 8))
   */
  fold(values, options) {
    return fold(this, values, options);
  }

  /**
   * Pivot columns into a cross-tabulation.
   * The pivot transform is an inverse of the *fold* transform.
   * The resulting table has new columns for each unique combination
   * of the provided *keys*, populated with the provided *values*.
   * The provided *values* must be aggregates, as a single set of keys may
   * include more than one row. If string-valued, the *any* aggregate is used.
   * If only one *values* column is defined, the new pivoted columns will
   * be named using key values directly. Otherwise, input value column names
   * will be included as a component of the output column names.
   * @param {import('./types.js').ExprList} keys
   *  Key values to map to new column names. The keys may be specified using
   *  column name strings, column index numbers, value objects with output
   *  column names for keys and table expressions for values, or selection
   *  helper functions.
   * @param {import('./types.js').ExprList} values Output values for pivoted
   *  columns. Column references will be wrapped in an *any* aggregate. If
   *  object-valued, the input object should have output value names for keys
   *  and aggregate table expressions for values.
   * @param {import('./types.js').PivotOptions} [options]
   *  Options for pivoting.
   * @return {this} A new pivoted table.
   * @example table.pivot('key', 'value')
   * @example table.pivot(['keyA', 'keyB'], ['valueA', 'valueB'])
   * @example table.pivot({ key: d => d.key }, { value: d => op.sum(d.value) })
   */
  pivot(keys, values, options) {
    return pivot(this, keys, values, options);
  }

  /**
   * Spread array elements into a set of new columns.
   * Output columns are named based on the value key and array index.
   * @param {import('./types.js').ExprList} values
   *  The column values to spread. The values may be specified using column
   *  name strings, column index numbers, value objects with output column
   *  names for keys and table expressions for values, or selection helper
   *  functions.
   * @param {import('./types.js').SpreadOptions } [options]
   *  Options for spreading.
   * @return {this} A new table with the spread columns added.
   * @example table.spread({ a: d => op.split(d.text, '') })
   * @example table.spread('arrayCol', { limit: 100 })
   */
  spread(values, options) {
    return spread(this, values, options);
  }

  /**
   * Unroll one or more array-valued columns into new rows.
   * If more than one array value is used, the number of new rows
   * is the smaller of the limit and the largest length.
   * Values for all other columns are copied over.
   * @param {import('./types.js').ExprList} values
   *  The column values to unroll. The values may be specified using column
   *  name strings, column index numbers, value objects with output column
   *  names for keys and table expressions for values, or selection helper
   *  functions.
   * @param {import('./types.js').UnrollOptions} [options]
   *  Options for unrolling.
   * @return {this} A new unrolled table.
   * @example table.unroll('colA', { limit: 1000 })
   */
  unroll(values, options) {
    return unroll(this, values, options);
  }

  // -- Joins ---------------------------------------------------------------

  /**
   * Lookup values from a secondary table and add them as new columns.
   * A lookup occurs upon matching key values for rows in both tables.
   * If the secondary table has multiple rows with the same key, only
   * the last observed instance will be considered in the lookup.
   * Lookup is similar to *join_left*, but with a simpler
   * syntax and the added constraint of allowing at most one match only.
   * @param {import('./types.js').TableRef} other
   *  The secondary table to look up values from.
   * @param {import('./types.js').JoinKeys} [on]
   *  Lookup keys (column name strings or table expressions) for this table
   *  and the secondary table, respectively. If unspecified, the values of
   *  all columns with matching names are compared.
   * @param {...import('./types.js').ExprList} [values]
   *  The column values to add from the secondary table. Can be column name
   *  strings or objects with column names as keys and table expressions as
   *  values. If unspecified, includes all columns from the secondary table
   *  whose names do no match any column in the primary table.
   * @return {this} A new table with lookup values added.
   * @example table.lookup(other, ['key1', 'key2'], 'value1', 'value2')
   */
  lookup(other, on, ...values) {
    return lookup(this, other, on, ...values);
  }

  /**
   * Join two tables, extending the columns of one table with
   * values from the other table. The current table is considered
   * the "left" table in the join, and the new table input is
   * considered the "right" table in the join. By default an inner
   * join is performed, removing all rows that do not match the
   * join criteria. To perform left, right, or full outer joins, use
   * the *join_left*, *join_right*, or *join_full* methods, or provide
   * an options argument.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinPredicate} [on]
   *  The join criteria for matching table rows. If unspecified, the values of
   *  all columns with matching names are compared.
   *  If array-valued, a two-element array should be provided, containing
   *  the columns to compare for the left and right tables, respectively.
   *  If a one-element array or a string value is provided, the same
   *  column names will be drawn from both tables.
   *  If function-valued, should be a two-table table expression that
   *  returns a boolean value. When providing a custom predicate, note that
   *  join key values can be arrays or objects, and that normal join
   *  semantics do not consider null or undefined values to be equal (that is,
   *  null !== null). Use the op.equal function to handle these cases.
   * @param {import('./types.js').JoinValues} [values]
   *  The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions *all*, *not*, or *range*.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {import('./types.js').JoinOptions} [options]
   *  Options for the join.
   * @return {this} A new joined table.
   * @example table.join(other, ['keyL', 'keyR'])
   * @example table.join(other, (a, b) => op.equal(a.keyL, b.keyR))
   */
  join(other, on, values, options) {
    return join(this, other, on, values, options);
  }

  /**
   * Perform a left outer join on two tables. Rows in the left table
   * that do not match a row in the right table will be preserved.
   * This is a convenience method with fixed options for *join*.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinPredicate} [on]
   *  The join criteria for matching table rows.
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
   * @param {import('./types.js').JoinValues} [values]
   *  he columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions *all*, *not*, or *range*.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {import('./types.js').JoinOptions} [options]
   *  Options for the join. With this method, any options will be
   *  overridden with `{left: true, right: false}`.
   * @return {this} A new joined table.
   * @example table.join_left(other, ['keyL', 'keyR'])
   * @example table.join_left(other, (a, b) => op.equal(a.keyL, b.keyR))
   */
  join_left(other, on, values, options) {
    const opt = { ...options, left: true, right: false };
    return join(this, other, on, values, opt);
  }

  /**
   * Perform a right outer join on two tables. Rows in the right table
   * that do not match a row in the left table will be preserved.
   * This is a convenience method with fixed options for *join*.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinPredicate} [on]
   *  The join criteria for matching table rows.
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
   * @param {import('./types.js').JoinValues} [values]
   *  The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions *all*, *not*, or *range*.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {import('./types.js').JoinOptions} [options]
   *  Options for the join. With this method, any options will be overridden
   *  with `{left: false, right: true}`.
   * @return {this} A new joined table.
   * @example table.join_right(other, ['keyL', 'keyR'])
   * @example table.join_right(other, (a, b) => op.equal(a.keyL, b.keyR))
   */
  join_right(other, on, values, options) {
    const opt = { ...options, left: false, right: true };
    return join(this, other, on, values, opt);
  }

  /**
   * Perform a full outer join on two tables. Rows in either the left or
   * right table that do not match a row in the other will be preserved.
   * This is a convenience method with fixed options for *join*.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinPredicate} [on]
   *  The join criteria for matching table rows.
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
   * @param {import('./types.js').JoinValues} [values]
   *  The columns to include in the join output.
   *  If unspecified, all columns from both tables are included; paired
   *  join keys sharing the same column name are included only once.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions *all*, *not*, or *range*.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {import('./types.js').JoinOptions} [options]
   *  Options for the join. With this method, any options will be overridden
   *  with `{left: true, right: true}`.
   * @return {this} A new joined table.
   * @example table.join_full(other, ['keyL', 'keyR'])
   * @example table.join_full(other, (a, b) => op.equal(a.keyL, b.keyR))
   */
  join_full(other, on, values, options) {
    const opt = { ...options, left: true, right: true };
    return join(this, other, on, values, opt);
  }

  /**
   * Produce the Cartesian cross product of two tables. The output table
   * has one row for every pair of input table rows. Beware that outputs
   * may be quite large, as the number of output rows is the product of
   * the input row counts.
   * This is a convenience method for *join* in which the
   * join criteria is always true.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinValues} [values]
   *  The columns to include in the output.
   *  If unspecified, all columns from both tables are included.
   *  If array-valued, a two element array should be provided, containing
   *  the columns to include for the left and right tables, respectively.
   *  Array input may consist of column name strings, objects with output
   *  names as keys and single-table table expressions as values, or the
   *  selection helper functions *all*, *not*, or *range*.
   *  If object-valued, specifies the key-value pairs for each output,
   *  defined using two-table table expressions.
   * @param {import('./types.js').JoinOptions} [options]
   *  Options for the join.
   * @return {this} A new joined table.
   * @example table.cross(other)
   * @example table.cross(other, [['leftKey', 'leftVal'], ['rightVal']])
   */
  cross(other, values, options) {
    return cross(this, other, values, options);
  }

  /**
   * Perform a semi-join, filtering the left table to only rows that
   * match a row in the right table.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinPredicate} [on]
   *  The join criteria for matching table rows.
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
   * @example table.semijoin(other, (a, b) => op.equal(a.keyL, b.keyR))
   */
  semijoin(other, on) {
    return semijoin(this, other, on);
  }

  /**
   * Perform an anti-join, filtering the left table to only rows that
   * do *not* match a row in the right table.
   * @param {import('./types.js').TableRef} other
   *  The other (right) table to join with.
   * @param {import('./types.js').JoinPredicate} [on]
   *  The join criteria for matching table rows.
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
   * @example table.antijoin(other, (a, b) => op.equal(a.keyL, b.keyR))
   */
  antijoin(other, on) {
    return antijoin(this, other, on);
  }

  // -- Set Operations ------------------------------------------------------

  /**
   * Concatenate multiple tables into a single table, preserving all rows.
   * This transformation mirrors the UNION_ALL operation in SQL.
   * Only named columns in this table are included in the output.
   * @param  {...import('./types.js').TableRefList} tables
   *  A list of tables to concatenate.
   * @return {this} A new concatenated table.
   * @example table.concat(other)
   * @example table.concat(other1, other2)
   * @example table.concat([other1, other2])
   */
  concat(...tables) {
    return concat(this, ...tables);
  }

  /**
   * Union multiple tables into a single table, deduplicating all rows.
   * This transformation mirrors the UNION operation in SQL. It is
   * similar to *concat* but suppresses duplicate rows with
   * values identical to another row.
   * Only named columns in this table are included in the output.
   * @param  {...import('./types.js').TableRefList} tables
   *  A list of tables to union.
   * @return {this} A new unioned table.
   * @example table.union(other)
   * @example table.union(other1, other2)
   * @example table.union([other1, other2])
   */
  union(...tables) {
    return union(this, ...tables);
  }

  /**
   * Intersect multiple tables, keeping only rows whose with identical
   * values for all columns in all tables, and deduplicates the rows.
   * This transformation is similar to a series of *semijoin*.
   * calls, but additionally suppresses duplicate rows.
   * @param  {...import('./types.js').TableRefList} tables
   *  A list of tables to intersect.
   * @return {this} A new filtered table.
   * @example table.intersect(other)
   * @example table.intersect(other1, other2)
   * @example table.intersect([other1, other2])
   */
  intersect(...tables) {
    return intersect(this, ...tables);
  }

  /**
   * Compute the set difference with multiple tables, keeping only rows in
   * this table that whose values do not occur in the other tables.
   * This transformation is similar to a series of *anitjoin*
   * calls, but additionally suppresses duplicate rows.
   * @param  {...import('./types.js').TableRefList} tables
   *  A list of tables to difference.
   * @return {this} A new filtered table.
   * @example table.except(other)
   * @example table.except(other1, other2)
   * @example table.except([other1, other2])
   */
  except(...tables) {
    return except(this, ...tables);
  }

  // -- Table Output Formats ------------------------------------------------

  /**
   * Format this table as a Flechette Arrow table.
   * @param {import('../format/types.js').ArrowFormatOptions} [options]
   *  The Arrow formatting options.
   * @return {import('@uwdata/flechette').Table} A Flechette Arrow table.
   */
  toArrow(options) {
    return toArrow(this, options);
  }

  /**
   * Format this table as binary data in the Apache Arrow IPC format.
   * @param {import('../format/types.js').ArrowIPCFormatOptions} [options]
   *  The Arrow IPC formatting options.
   * @return {Uint8Array} A new Uint8Array of Arrow-encoded binary data.
   */
  toArrowIPC(options) {
    return toArrowIPC(this, options);
  }

  /**
   * Format this table as a comma-separated values (CSV) string. Other
   * delimiters, such as tabs or pipes ('|'), can be specified using
   * the options argument.
   * @param {import('../format/to-csv.js').CSVFormatOptions} [options]
   *   The CSV formatting options.
   * @return {string} A delimited value string.
   */
  toCSV(options) {
    return toCSV(this, options);
  }

  /**
   * Format this table as an HTML table string.
   * @param {import('../format/to-html.js').HTMLFormatOptions} [options]
   *  The HTML formatting options.
   * @return {string} An HTML table string.
   */
  toHTML(options) {
    return toHTML(this, options);
  }

  /**
   * Format this table as a JavaScript Object Notation (JSON) string.
   * @param {import('../format/to-json.js').JSONFormatOptions} [options]
   *  The JSON formatting options.
   * @return {string} A JSON string.
   */
  toJSON(options) {
    return toJSON(this, options);
  }

  /**
   * Format this table as a GitHub-Flavored Markdown table string.
   * @param {import('../format/to-markdown.js').MarkdownFormatOptions} [options]
   *  The Markdown formatting options.
   * @return {string} A GitHub-Flavored Markdown table string.
   */
  toMarkdown(options) {
    return toMarkdown(this, options);
  }
}

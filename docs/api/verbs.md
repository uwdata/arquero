---
title: Verbs \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [Table](table) | [**Verbs**](verbs) | [Op Functions](op) | [Expressions](expressions)

* [Core Verbs](#verbs)
  * [derive](#derive)
  * [filter](#filter)
  * [groupby](#groupby), [ungroup](#ungroup)
  * [orderby](#orderby), [unorder](#unorder)
  * [rollup](#rollup), [count](#count)
  * [sample](#sample)
  * [select](#select)
  * [reify](#reify)
* [Join Verbs](#joins)
  * [join](#join), [join_left](#join_left), [join_right](#join_right), [join_full](#join_full), [cross](#cross), [lookup](#lookup)
  * [semijoin](#semijoin), [antijoin](#antijoin)
* [Reshape Verbs](#reshape)
  * [fold](#fold), [pivot](#pivot)
  * [spread](#spread), [unroll](#unroll)
* [Set Verbs](#sets):
  * [dedupe](#dedupe)
  * [concat](#concat), [union](#union)
  * [intersect](#intersect), [except](#except)

<br/>

## <a id="core">Core Verbs</a>

<hr/><a id="derive" href="#derive">#</a>
<em>table</em>.<b>derive</b>(<i>values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Derive new column values based on the provided expressions.

* *values*: Object of name-value pairs defining the columns to derive. The input object should have output column names for keys and table expressions for values.

*Examples*

```js
table.derive({ sumXY: d => d.x + d.y })
```

<hr/><a id="filter" href="#filter">#</a>
<em>table</em>.<b>filter</b>(<i>criteria</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Filter a table to a subset of rows based on the input criteria. The resulting table provides a filtered view over the original data; no data copy is made. To create a table that copies only filtered data to new data structures, call [reify](#reify) on the output table.

* *criteria*: The filter criteria as a table expression. Both aggregate and window functions are permitted, and will take into account any [groupby](#groupby) or [orderby](#orderby) settings.

*Examples*

```js
table.filter(d => abs(d.value) < 5)
```

<hr/><a id="groupby" href="#groupby">#</a>
<em>table</em>.<b>groupby</b>(<i>...keys</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Group table rows based on a set of column values. Subsequent operations that are sensitive to grouping (such as aggregate functions) will operate over the grouped rows. To undo grouping, use [ungroup](#ungroup).

* *keys*: Key column values to group by. Keys may be column name strings, column index numbers, or value objects with output column names for keys and table expressions for values.

*Examples*

```js
table.groupby('colA', 'colB')
```

```js
table.groupby({ key: d => d.colA + d.colB })
```

<hr/><a id="ungroup" href="#ungroup">#</a>
<em>table</em>.<b>ungroup</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Ungroup a table, removing any grouping criteria. Undoes the effects of [groupby](#groupby).

*Examples*

```js
table.ungroup()
```


<hr/><a id="orderby" href="#orderby">#</a>
<em>table</em>.<b>orderby</b>(<i>...keys</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Order table rows based on a set of column values. Subsequent operations sensitive to ordering (such as window functions) will operate over sorted values. The resulting table provides an view over the original data, without any copying. To create a table with sorted data copied to new data strucures, call [reify](#reify) on the result of this method. To undo ordering, use [unorder](#unorder).

* *keys*: Key values to sort by, in precedence order. By default, sorting is done in ascending order. To sort in descending order, wrap values using [desc](./#desc). If a string, order by the column with that name. If a number, order by the column with that index. If a function, must be a valid table expression; aggregate functions are permitted, but window functions are not. If an object, object values must be valid values parameters with output column names for keys and table expressions for values (the output names will be ignored). If an array, array values must be valid key parameters.

*Examples*

```js
table.orderby('a', desc('b'))
```

```js
table.orderby({ a: 'a', b: desc('b') )})
```

```js
table.orderby(desc(d => d.a))
```

<hr/><a id="unorder" href="#unorder">#</a>
<em>table</em>.<b>unorder</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Unorder a table, removing any sorting criteria. Undoes the effects of [orderby](#orderby).

*Examples*

```js
table.unorder()
```


<hr/><a id="rollup" href="#rollup">#</a>
<em>table</em>.<b>rollup</b>(<i>values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Rollup a table to produce an aggregate summary. Often used in conjunction with [groupby](#groupby). To produce counts only, [count](#count) provides a convenient shortcut.

* *values*: Object of name-value pairs defining aggregated output columns. The input object should have output column names for keys and table expressions for values.

*Examples*

```js
table.groupby('colA').rollup({ mean: d => mean(d.colB) })
```

```js
table.groupby('colA').rollup({ mean: op.median('colB') })
```

<hr/><a id="count" href="#count">#</a>
<em>table</em>.<b>count</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Count the number of values in a group. This method is a shorthand for [rollup](#rollup) with a [count](op#count) aggregate function.

* *options*: An options object:
  * *as*: The name of the output count column (default `'count'`).

*Examples*

```js
table.groupby('colA').count()
```

```js
table.groupby('colA').count({ as: 'num' })
```


<hr/><a id="sample" href="#sample">#</a>
<em>table</em>.<b>sample</b>(<i>size</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Generate a table from a random sample of rows. If the table is grouped, perform [stratified sampling](https://en.wikipedia.org/wiki/Stratified_sampling) by sampling separately from each group.

* *size*: The number of samples to draw per group. If number-valued, the same sample size is used for each group. If function-valued, the input should be an aggregate table expression compatible with [rollup](#rollup).
* *options*: An options object:
  * *replace*: Boolean flag (default `false`) to sample with replacement.
  * *weight*: Column values to use as weights for sampling. Rows will be sampled with probability proportional to their relative weight. The input should be a column name string or a table expression compatible with [derive](#derive).

*Examples*

```js
table.sample(50)
```

```js
table.sample(100, { replace: true })
```

```js
// stratified sampling with dynamic sample size
table.groupby('colA').sample(() => op.floor(0.5 * op.count()))
```

<hr/><a id="select" href="#select">#</a>
<em>table</em>.<b>select</b>(...columns) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Select a subset of columns into a new table, potentially renaming them.

* *columns*: The columns to select. The input may consist of: column name strings, column integer indices, objects with current column names as keys and new column names as values (for renaming), or functions that take a table as input and return a valid selection parameter (typically the output of the selection helper functions [all](./#all), [not](./#not), or [range](./#range)).

*Examples*

```js
table.select('colA', 'colB')
```

```js
table.select(not('colB', 'colC'))
```

```js
table.select({ colA: 'newA', colB: 'newB' })
```


<hr/><a id="reify" href="#reify">#</a>
<em>table</em>.<b>reify</b>([<i>indices</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Create a new fully-materialized instance of this table. All filter and orderby settings are removed from the new table. Instead, the data itself is filtered and ordered as needed to produce new backing data columns.

* *indices*: An array of ordered row indices to materialize. If unspecified, all rows passing the table filter are used.


<br/>

## <a id="joins">Join Verbs</a>

<hr/><a id="join" href="#join">#</a>
<em>table</em>.<b>join</b>(<i>other</i>[, <i>on</i>, <i>values</i>, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Join two tables, extending the columns of one table with values from the *other* table. The current table is considered the "left" table in the join, and the new table input is considered the "right" table in the join. By default an [inner join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Inner_join) is performed, removing all rows that do not match the join criteria. To perform left, right, or full outer joins, use the [join_left](#join_left}), [join_right](#join_right), or [join_full](#join_full) methods, or provide an *options* argument.

* *other*: The other (right) table to join with.
* *on*: The join criteria for matching table rows. If unspecified, the values of all columns with matching names are compared. If array-valued, a two-element array should be provided, containing the columns to compare for the left and right tables, respectively. If function-valued, should be a two-table table expression that returns a boolean value. When providing a custom predicate, note that join key values can be arrays or objects, and that normal join semantics do not consider null or undefined values to be equal (that is, `null !== null`. Use the [op.equal](op#equal) function to handle these cases.
* *values*: The columns to include in the join output. If unspecified, all columns from both tables are included. If array-valued, a two element array should be provided, containing column selections to include from the left and right tables, respectively. Array input may consist of column name strings, objects with output names as keys and single-table table expressions as values, or the selection helper functions [all](./#all), [not](./#not), or [range](./#range)). If object-valued, specifies the key-value pairs for each output, defined using two-table table expressions.
* *options*: An options object:
  * *left*: Boolean flag (default `false`) indicating a [left outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Left_outer_join). If both *left* and *right* are true, indicates a [full outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Full_outer_join).
  * *right* Boolean flag (default `false`) indicating a [right outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Right_outer_join). If both the *left* and *right* are true, indicates a [full outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Full_outer_join).
   * *suffix*: Column name suffixes to append, for the left and right tables, respectively, when two columns with the same name are produced by the join (default `['_1', '_2']`).

*Examples*

```js
table.join(other, ['keyL', 'keyR'])
```

```js
table.join(other, (a, b) => op.equal(a.keyL, b.keyR))
```


<hr/><a id="join_left" href="#join_left">#</a>
<em>table</em>.<b>join_left</b>(<i>other</i>[, <i>on</i>, <i>values</i>, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Perform a [left outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Left_outer_join) on two tables. Rows in the left table that do not match a row in the right table will be preserved. This method is a convenient shorthand with fixed options `{left: true, right: false}` passed to [join](#join).

* *other*: The other (right) table to join with.
* *on*: The join criteria for matching table rows. If unspecified, the values of all columns with matching names are compared. If array-valued, a two-element array should be provided, containing the columns to compare for the left and right tables, respectively. If function-valued, should be a two-table table expression that returns a boolean value. When providing a custom predicate, note that join key values can be arrays or objects, and that normal join semantics do not consider null or undefined values to be equal (that is, `null !== null`. Use the [op.equal](op#equal) function to handle these cases.
* *values*: The columns to include in the join output. If unspecified, all columns from both tables are included. If array-valued, a two element array should be provided, containing column selections to include from the left and right tables, respectively. Array input may consist of column name strings, objects with output names as keys and single-table table expressions as values, or the selection helper functions [all](./#all), [not](./#not), or [range](./#range)). If object-valued, specifies the key-value pairs for each output, defined using two-table table expressions.
* *options*: An options object:
   * *suffix*: Column name suffixes to append, for the left and right tables, respectively, when two columns with the same name are produced by the join (default `['_1', '_2']`).

*Examples*

```js
table.join_left(other, ['keyL', 'keyR'])
```

```js
table.join_left(other, (a, b) => op.equal(a.keyL, b.keyR))
```


<hr/><a id="join_right" href="#join_right">#</a>
<em>table</em>.<b>join_right</b>(<i>other</i>[, <i>on</i>, <i>values</i>, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Perform a [right outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Right_outer_join) on two tables. Rows in the right table that do not match a row in the left table will be preserved. This method is a convenient shorthand with fixed options `{left: false, right: true}` passed to [join](#join).

* *other*: The other (right) table to join with.
* *on*: The join criteria for matching table rows. If unspecified, the values of all columns with matching names are compared. If array-valued, a two-element array should be provided, containing the columns to compare for the left and right tables, respectively. If function-valued, should be a two-table table expression that returns a boolean value. When providing a custom predicate, note that join key values can be arrays or objects, and that normal join semantics do not consider null or undefined values to be equal (that is, `null !== null`. Use the [op.equal](op#equal) function to handle these cases.
* *values*: The columns to include in the join output. If unspecified, all columns from both tables are included. If array-valued, a two element array should be provided, containing column selections to include from the left and right tables, respectively. Array input may consist of column name strings, objects with output names as keys and single-table table expressions as values, or the selection helper functions [all](./#all), [not](./#not), or [range](./#range)). If object-valued, specifies the key-value pairs for each output, defined using two-table table expressions.
* *options*: An options object:
   * *suffix*: Column name suffixes to append, for the left and right tables, respectively, when two columns with the same name are produced by the join (default `['_1', '_2']`).

*Examples*

```js
table.join_right(other, ['keyL', 'keyR'])
```

```js
table.join_right(other, (a, b) => op.equal(a.keyL, b.keyR))
```

<hr/><a id="join_full" href="#join_full">#</a>
<em>table</em>.<b>join_full</b>(<i>other</i>[, <i>on</i>, <i>values</i>, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Perform a [full outer join](https://en.wikipedia.org/wiki/Join_%28SQL%29#Full_outer_join) on two tables. Rows in either the left or right table that do not match a row in the other will be preserved. This method is a convenient shorthand with fixed options `{left: true, right: true}` passed to [join](#join).

* *other*: The other (right) table to join with.
* *on*: The join criteria for matching table rows. If unspecified, the values of all columns with matching names are compared. If array-valued, a two-element array should be provided, containing the columns to compare for the left and right tables, respectively. If function-valued, should be a two-table table expression that returns a boolean value. When providing a custom predicate, note that join key values can be arrays or objects, and that normal join semantics do not consider null or undefined values to be equal (that is, `null !== null`. Use the [op.equal](op#equal) function to handle these cases.
* *values*: The columns to include in the join output. If unspecified, all columns from both tables are included. If array-valued, a two element array should be provided, containing column selections to include from the left and right tables, respectively. Array input may consist of column name strings, objects with output names as keys and single-table table expressions as values, or the selection helper functions [all](./#all), [not](./#not), or [range](./#range)). If object-valued, specifies the key-value pairs for each output, defined using two-table table expressions.
* *options*: An options object:
   * *suffix*: Column name suffixes to append, for the left and right tables, respectively, when two columns with the same name are produced by the join (default `['_1', '_2']`).

*Examples*

```js
table.join_full(other, ['keyL', 'keyR'])
```

```js
table.join_full(other, (a, b) => op.equal(a.keyL, b.keyR))
```

<hr/><a id="cross" href="#cross">#</a>
<em>table</em>.<b>cross</b>(<i>other</i>[, <i>values</i>, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Produce the [Cartesian cross product](https://en.wikipedia.org/wiki/Join_%28SQL%29#Cross_join) of two tables. The output table has one row for every pair of input table rows. Beware that outputs may be quite large, as the number of output rows is the product of the input row counts. This method is a convenient shorthand for a [join](#join) in which the join criteria is always true.

* *other*: The other (right) table to join with.
* *values*: The columns to include in the join output. If unspecified, all columns from both tables are included. If array-valued, a two element array should be provided, containing column selections to include from the left and right tables, respectively. Array input may consist of column name strings, objects with output names as keys and single-table table expressions as values, or the selection helper functions [all](./#all), [not](./#not), or [range](./#range)). If object-valued, specifies the key-value pairs for each output, defined using two-table table expressions.
* *options*: An options object:
   * *suffix*: Column name suffixes to append, for the left and right tables, respectively, when two columns with the same name are produced by the join (default `['_1', '_2']`).

*Examples*

```js
table.cross(other)
```

```js
table.cross(other, [['leftKey', 'leftVal'], ['rightVal']])
```

<hr/><a id="lookup" href="#lookup">#</a>
<em>table</em>.<b>lookup</b>(<i>other</i>, <i>on</i>, <i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Lookup values from a secondary table and add them as new columns. A lookup occurs upon matching key values for rows in both tables. If the secondary table has multiple rows with the same key, only the last observed instance will be considered in the lookup. Lookup is similar to [join_left](#join_left), but with a streamlined syntax and the added constraint of allowing at most one match only.

* *other*: The secondary table to look up values from.
* *on*: A two-element array of lookup keys (column name strings or table expressions) for this table and the secondary table, respectively.
* *values*: The column values to add from the secondary table. Can be column name strings or objects with column names as keys and table expressions as values.

*Example*

```js
table.lookup(other, ['key1', 'key2'], 'value1', 'value2')
```

<hr/><a id="semijoin" href="#semijoin">#</a>
<em>table</em>.<b>semijoin</b>(<i>other</i>[, <i>on</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Perform a [semi-join](https://en.wikipedia.org/wiki/Relational_algebra#Semijoin), filtering the left table to only rows that match a row in the right table.

* *other*: The other (right) table to join with.
* *on* * *on*: The join criteria for matching table rows. If unspecified, the values of all columns with matching names are compared. If array-valued, a two-element array should be provided, containing the columns to compare for the left and right tables, respectively. If function-valued, should be a two-table table expression that returns a boolean value. When providing a custom predicate, note that join key values can be arrays or objects, and that normal join semantics do not consider null or undefined values to be equal (that is, `null !== null`. Use the [op.equal](op#equal) function to handle these cases.

*Examples*

```js
table.semijoin(other)
```

```js
table.semijoin(other, ['keyL', 'keyR'])
```

```js
table.semijoin(other, (a, b) => op.equal(a.keyL, b.keyR))
```


<hr/><a id="antijoin" href="#antijoin">#</a>
<em>table</em>.<b>antijoin</b>(<i>other</i>[, <i>on</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Perform an [anti-join](https://en.wikipedia.org/wiki/Relational_algebra#Antijoin), filtering the left table to only rows that do *not* match a row in the right table.

* *other*: The other (right) table to join with.
* *on* * *on*: The join criteria for matching table rows. If unspecified, the values of all columns with matching names are compared. If array-valued, a two-element array should be provided, containing the columns to compare for the left and right tables, respectively. If function-valued, should be a two-table table expression that returns a boolean value. When providing a custom predicate, note that join key values can be arrays or objects, and that normal join semantics do not consider null or undefined values to be equal (that is, `null !== null`. Use the [op.equal](op#equal) function to handle these cases.

*Examples*

```js
table.antijoin(other)
```

```js
table.antijoin(other, ['keyL', 'keyR'])
```

```js
table.antijoin(other, (a, b) => op.equal(a.keyL, b.keyR))
```


<br/>

## <a id="reshape">Reshape Verbs</a>

<hr/><a id="fold" href="#fold">#</a>
<em>table</em>.<b>fold</b>(<i>values</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Fold one or more columns into two key-value pair columns. The fold transform is an inverse of the [pivot](#pivot) transform. The resulting table has two new columns, one containing the column names (named "key") and the other the column values (named "value"). The number of output rows equals the original row count multiplied by the number of folded columns.

* *values*: The columns to fold. The input may consist of an array with column name strings, objects with output names as keys and current names as values (output names will be ignored), or the output of the selection helper functions [all](./#all), [not](./#not), or [range](./#range)).
* *options*: An options object:
  * *as*: A two-element array indicating the output column names to use for the key and value columns, respectively. The default is `['key', 'value']`.

*Examples*

```js
table.fold('colA')
```

```js
table.fold(['colA', 'colB'])
```

```js
table.fold(range(5, 8))
```


<hr/><a id="pivot" href="#pivot">#</a>
<em>table</em>.<b>pivot</b>(<i>keys</i>, <i>values</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Pivot columns into a cross-tabulation. The pivot transform is an inverse of the [fold](#fold) transform. The resulting table has new columns for each unique combination of the provided *keys*, populated with the provided *values*. The provided *values* must be aggregates, as a single set of keys may include more than one row. If string-valued, the [any](op#any) aggregate is used. If only one *values* column is defined, the new pivoted columns are named using key values directly. Otherwise, input value column names are included as a component of the output column names.

* *keys*: Key values to map to new column names. Keys may be an array of column name strings, column index numbers, or value objects with output column names for keys and table expressions for values.
* *values*: Output values for pivoted columns. Column string names will be wrapped in any [any](op#any) aggregate. If object-valued, the input object should have output value names for keys and aggregate table expressions for values.
* *options*: An options object:
  * *limit*: The maximum number of new columns to generate (default `Infinity`).
  * *keySeparator*: A string to place between multiple key names (default `'_'`).
  * *valueSeparator*: A string to place between key and value names (default `'_'`).
  * *sort*: A boolean flag (default `true`) for alphabetical sorting of new column names.

*Examples*

```js
table.pivot('key', 'value')
```

```js
table.pivot(['keyA', 'keyB'], ['valueA', 'valueB'])
```

```js
table.pivot({ key: d => d.key }, { value: d => sum(d.value) })
```


<hr/><a id="spread" href="#spread">#</a>
<em>table</em>.<b>spread</b>(<i>values</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Spread array elements into a set of new columns. Output columns are named based on both the value key and array index.

* *values*: The columns to spread, as either an array of column names or a key-value object of table expressions.
* *options*: An options object:
  * *limit*: The maximum number of new columns to generate (default `Infinity`).
  * *as*: String array of output column names to use. This option only applies when a single column is spread. If the given array of names is shorter than the number of generated columns, the additional columns will be named using the standard naming convention.

*Examples*

```js
table.spread({ a: split(d.text, '') })
```

```js
table.spread('arrayCol', { limit: 100 })
```

```js
table.spread('arrayCol', { limit: 2, as: ['value1', 'value2'] })
```


<hr/><a id="unroll" href="#unroll">#</a>
<em>table</em>.<b>unroll</b>(<i>values</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Unroll one or more array-valued columns into new rows. If more than one array value is used, the number of new rows is the smaller of the limit and the largest length. Values for all other columns are copied over.

* *values*: The columns to unroll, as either an array of column names or a key-value object of table expressions.
* *index*: Boolean flag (default `false`) or column name or adding zero-based array index values as an output column. If `true`, a new column named "index" will be added. If string-valued, a new column with the given name will be added.
* *options*: An options object:
  * *limit*: The maximum number of new columns to generate per array value (default `Infinity`).
  * *drop*: A selection of columns to drop (exclude) from the unrolled output. The input may consist of column name strings, column integer indices, objects with output names as keys (object values will be ignored), or the output of the selection helper functions [all](./#all), [not](./#not), or [range](./#range)).

*Examples*

```js
table.unroll('colA', { limit: 1000 })
```

```js
table.unroll('colA', { limit: 1000, index: 'idxnum' })
```


<br/>

## <a id="sets">Set Verbs</a>

<hr/><a id="dedupe" href="#dedupe">#</a>
<em>table</em>.<b>dedupe</b>(<i>...keys</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

De-duplicate table rows by removing repeated row values.

* *keys*: Key columns to check for duplicates. Two rows are considered duplicates if they have matching values for all keys. If keys are unspecified, all columns are used. Keys may be column name strings, column index numbers, or value objects with output column names for keys and table expressions for values.

*Examples*

```js
table.dedupe()
```

```js
table.dedupe('a', 'b')
```

```js
table.dedupe({ abs: d => op.abs(d.a) })
```


<hr/><a id="concat" href="#concat">#</a>
<em>table</em>.<b>concat</b>(<i>...tables</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Concatenate multiple tables into a single table, preserving all rows. This transformation mirrors the [UNION_ALL](https://en.wikipedia.org/wiki/Set_operations_%28SQL%29#UNION_operator) operation in SQL. It is similar to [union](#union) but retains all rows, without removing duplicates. Only named columns in this table are included in the output.

* *tables*: A list of tables to concatenate.

*Examples*

```js
table.concat(other)
```

```js
table.concat(other1, other2)
```

```js
table.concat([other1, other2])
```


<hr/><a id="union" href="#union">#</a>
<em>table</em>.<b>union</b>(<i>...tables</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Union multiple tables into a single table, deduplicating all rows. This transformation mirrors the [UNION](https://en.wikipedia.org/wiki/Set_operations_%28SQL%29#UNION_operator) operation in SQL. It is similar to [concat](#concat) but suppresses duplicate rows with values identical to another row. Only named columns in this table are included in the output.

* *tables*: A list of tables to union.

*Examples*

```js
table.union(other)
```

```js
table.union(other1, other2)
```

```js
table.union([other1, other2])
```


<hr/><a id="intersect" href="#intersect">#</a>
<em>table</em>.<b>intersect</b>(<i>...tables</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

[Intersect](https://en.wikipedia.org/wiki/Set_operations_%28SQL%29#INTERSECT_operator) multiple tables, keeping only rows with matching values for all columns in all tables, and deduplicates the rows. This transformation is similar to a series of one or more [semijoin](#semijoin) calls, but additionally suppresses duplicate rows.

* *tables*: A list of tables to intersect.

*Examples*

```js
table.intersect(other)
```

```js
table.intersect(other1, other2)
```

```js
table.intersect([other1, other2])
```


<hr/><a id="except" href="#except">#</a>
<em>table</em>.<b>except</b>(<i>...tables</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Compute the [set difference](https://en.wikipedia.org/wiki/Set_operations_%28SQL%29#EXCEPT_operator) with multiple tables, keeping only rows in this table that whose values do not occur in the other tables. This transformation is similar to a series of one or more [antijoin](#antijoin) calls, but additionally suppresses duplicate rows.

* *tables*: A list of tables to difference.

*Examples*

```js
table.except(other)
```

```js
table.except(other1, other2)
```

```js
table.except([other1, other2])
```
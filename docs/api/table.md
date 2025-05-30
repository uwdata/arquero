---
title: Table \| Arquero API Reference
---
# Arquero API Reference <a href="https://idl.uw.edu/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [**Table**](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions) | [Extensibility](extensibility)

* [Table Metadata](#metadata)
  * [numCols](#numCols), [numRows](#numRows), [size](#size), [totalRows](#totalRows)
  * [isFiltered](#isFiltered), [isGrouped](#isGrouped), [isOrdered](#isOrdered)
  * [comparator](#comparator), [groups](#groups), [mask](#mask)
  * [params](#params)
* [Table Columns](#columns)
  * [column](#column), [columnAt](#columnAt)
  * [columnIndex](#columnIndex), [columnName](#columnName), [columnNames](#columnNames)
* [Table Values](#table-values)
  * [array](#array), [values](#values)
  * [data](#data), [get](#get), [getter](#getter)
  * [indices](#indices), [partitions](#partitions), [scan](#scan)
* [Table Output](#output)
  * [objects](#objects), [object](#object), [Symbol.iterator](#@@iterator)
  * [print](#print), [toHTML](#toHTML), [toMarkdown](#toMarkdown)
  * [toArrow](#toArrow), [toArrowIPC](#toArrowIPC), [toCSV](#toCSV), [toJSON](#toJSON)


<br/>

## <a id="metadata">Table Metadata</a>

<hr/><a id="numCols" href="#numCols">#</a>
<em>table</em>.<b>numCols</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

The number of columns in this table.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .numCols() // 2
```

<hr/><a id="numRows" href="#numRows">#</a>
<em>table</em>.<b>numRows</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

The number of active (non-filtered) rows in this table. This number may be less than the [total rows](#totalRows) if the table has been filtered.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .numRows() // 3
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .filter(d => d.a > 2)
  .numRows() // 1
```

<hr/><a id="size" href="#size">#</a>
<em>table</em>.<b>size</b> · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

The number of active (non-filtered) rows in this table. This number is the same as [numRows()](#numRows), and may be less than the [total rows](#totalRows) if the table has been filtered.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .size // 3
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .filter(d => d.a > 2)
  .size // 1
```

<hr/><a id="totalRows" href="#totalRows">#</a>
<em>table</em>.<b>totalRows</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

The total number of rows in this table, including both filtered and unfiltered rows.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .totalRows() // 3
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .filter(d => d.a > 2)
  .totalRows() // 3
```

<hr/><a id="isFiltered" href="#isFiltered">#</a>
<em>table</em>.<b>isFiltered</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Indicates if the table has a filter applied.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .isFiltered() // false
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .filter(d => d.a > 2)
  .isFiltered() // true
```

<hr/><a id="isGrouped" href="#isGrouped">#</a>
<em>table</em>.<b>isGrouped</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Indicates if the table has a groupby specification.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .isGrouped() // false
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .groupby('a')
  .isGrouped() // true
```

<hr/><a id="isOrdered" href="#isOrdered">#</a>
<em>table</em>.<b>isOrdered</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Indicates if the table has a row order comparator.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .isOrdered() // false
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .orderby(aq.desc('b'))
  .isOrdered() // true
```

<hr/><a id="comparator" href="#comparator">#</a>
<em>table</em>.<b>comparator</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns the row order comparator function, if specified.

<hr/><a id="groups" href="#groups">#</a>
<em>table</em>.<b>groups</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns the groupby specification, if defined. A groupby specification is an object with the following properties:

* *names*: Output column names for each group field.
* *get*: Value accessor functions for each group field.
* *rows*: Row indices of example table rows for each group.
* *size*: The total number of groups.
* *keys*: Per-row group indices for every row in the table.

<hr/><a id="mask" href="#mask">#</a>
<em>table</em>.<b>mask</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns the bitset mask for filtered rows, or null if there is no filter.

<hr/><a id="params" href="#params">#</a>
<em>table</em>.<b>params</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Get or set table expression parameter values. If called with no arguments, returns the current parameter values as an object. Otherwise, adds the provided parameters to this table's parameter set and returns the table. Any prior parameters with names matching the input parameters are overridden.

Also see the [`escape()` expression helper](./#escape) for a lightweight alternative that allows access to variables defined in an enclosing scope.

* *values*: A set of parameter values to add as an object of name-value pairs.

*Examples*

```js
table.params({ hi: 5 }).filter((d, $) => abs(d.value) < $.hi)
```

<br/>

## <a id="columns">Table Columns</a>

<hr/><a id="column" href="#column">#</a>
<em>table</em>.<b>column</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Get the column instance with the given *name*, or `undefined` if does not exist. The returned column object provides a lightweight abstraction over the column storage (such as a backing array), providing a *length* property and *get(row)* method.

A column instance may be used across multiple tables and so does _not_ track a table's filter or orderby critera. To access filtered or ordered values, use the table [get](#get), [getter](#getter), or [array](#array) methods.

* *name*: The column name.

*Examples*

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
dt.column('b').get(1) // 5
```

<hr/><a id="columnAt" href="#columnAt">#</a>
<em>table</em>.<b>columnAt</b>(<i>index</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Get the column instance at the given index position, or `undefined` if does not exist. The returned column object provides a lightweight abstraction over the column storage (such as a backing array), providing a *length* property and *get(row)* method.

* *index*: The zero-based column index.

*Examples*

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
dt.columnAt(1).get(1) // 5
```

<hr/><a id="columnIndex" href="#columnIndex">#</a>
<em>table</em>.<b>columnIndex</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

The column index for the given name, or `-1` if the name is not found.

* *name*: The column name.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .columnIndex('b'); // 1
```

<hr/><a id="columnName" href="#columnName">#</a>
<em>table</em>.<b>columnName</b>(<i>index</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

The column name at the given index, or `undefined` if the index is out of range.

* *index*: The column index.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .columnName(1); // 'b'
```

<hr/><a id="columnNames" href="#columnNames">#</a>
<em>table</em>.<b>columnNames</b>([<i>filter</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an array of table column names, optionally filtered.

* *filter*: An optional filter callback function. If unspecified, all column names are returned. If *filter* is provided, it will be invoked for each column name and only those for which the callback returns a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value will be kept. The filter callback function is called with the following arguments:
  * *name*: The column name.
  * *index*: The column index.
  * *array*: The backing array of names.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .columnNames(); // [ 'a', 'b' ]
```


<br/>

## <a id="table-values">Table Values</a>

<hr/><a id="array" href="#array">#</a>
<em>table</em>.<b>array</b>(<i>name</i>[, <i>constructor</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Get an array of values contained in the column with the given *name*. Unlike direct access through the table [column](#column) method, the array returned by this method respects any table filter or orderby criteria. By default, a standard [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array) is returned; use the *constructor* argument to specify a [typed array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray).

* *name*: The column name.
* *constructor*: An optional array constructor (default [`Array`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Array)) to use to instantiate the output array. Note that errors or truncated values may occur when assigning to a typed array with an incompatible type.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .array('b'); // [ 4, 5, 6 ]
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .filter(d => d.a > 1)
  .array('b'); // [ 5, 6 ]
```

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .array('b', Int32Array); // Int32Array.of(4, 5, 6)
```

<hr/><a id="values" href="#values">#</a>
<em>table</em>.<b>values</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an iterator over values in the column with the given *name*. The iterator returned by this method respects any table filter or orderby criteria.

* *name*: The column name.

*Examples*

```js
for (const value of table.values('colA')) {
  // do something with ordered values from column A
}
```

```js
// slightly less efficient version of table.array('colA')
const colValues = Array.from(table.values('colA'));
```

<hr/><a id="data" href="#data">#</a>
<em>table</em>.<b>data</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns the internal table storage data structure: an object with column names for keys and column arrays for values. This method returns the same structure used by the Table (not a copy) and its contents should not be modified.

<hr/><a id="get" href="#get">#</a>
<em>table</em>.<b>get</b>(<i>name</i>[, <i>row</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Get the value for the given column and row. Row indices are relative to any filtering and ordering criteria, not the internal data layout.

* *name*: The column name.
* *row*: The row index (default `0`), relative to any filtering or ordering criteria.

*Examples*

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] });
dt.get('a', 0) // 1
dt.get('a', 2) // 3
```

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .orderby(aq.desc('b'));
dt.get('a', 0) // 3
dt.get('a', 2) // 1
```

<hr/><a id="getter" href="#getter">#</a>
<em>table</em>.<b>getter</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an accessor ("getter") function for a column. The returned function takes a row index as its single argument and returns the corresponding column value. Row indices are relative to any filtering and ordering criteria, not the internal data layout.

* *name*: The column name.

*Examples*

```js
const get = aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).getter('a');
get(0) // 1
get(2) // 3
```

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .orderby(aq.desc('b'))
  .getter('a');
get(0) // 3
get(2) // 1
```

<hr/><a id="indices" href="#indices">#</a>
<em>table</em>.<b>indices</b>([<i>order</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an array of indices for all rows passing the table filter.

* *order*: A boolean flag (default `true`) indicating if the returned indices should be sorted if this table is ordered. If `false`, the returned indices may or may not be sorted.

<hr/><a id="partitions" href="#partitions">#</a>
<em>table</em>.<b>partitions</b>([<i>order</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an array of indices for each group in the table. If the table is not grouped, the result is the same as [indices](#indices), but wrapped within an array. Otherwise returns an array of row index arrays, one per group. The indices will be filtered if the table has been filtered.

* *order*: A boolean flag (default `true`) indicating if the returned indices should be sorted if this table is ordered. If `false`, the returned indices may or may not be sorted.

<hr/><a id="scan" href="#scan">#</a>
<em>table</em>.<b>scan</b>(<i>callback</i>[, <i>order</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Perform a table scan, invoking the provided *callback* function for each row of the table. If this table is filtered, only rows passing the filter are visited.

* *callback*: Function invoked for each row of the table. The callback is invoked with the following arguments:
  * *row*: The table row index.
  * *data*: The backing table data store (as returned by table [`data`](#data) method).
  * *stop*: A function to stop the scan early. The callback can invoke *stop()* to prevent future scan calls.
* *order*: A boolean flag (default `false`), indicating if the table should be scanned in the order determined by [orderby](verbs#orderby). This argument has no effect if the table is unordered.


<br/>

## <a id="output">Table Output</a>

<hr/><a id="objects" href="#objects">#</a>
<em>table</em>.<b>objects</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an array of objects representing table rows. A new set of objects will be created, copying the backing table data.

* *options*: Options for row generation:
  * *limit*: The maximum number of objects to create (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: An ordered set of columns to include. The input may consist of: column name strings, column integer indices, objects with current column names as keys and new column names as values (for renaming), or a selection helper function such as [all](#all), [not](#not), or [range](#range)).
  * *grouped*: The export format for groups of rows. This option only applies to tables with groups set with the [groupby](verbs/#groupby) verb. The default (`false`) is to ignore groups, returning a flat array of objects. The valid values are `true` or `'map'` (for [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) instances), `'object'` (for standard [Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)), or `'entries'` (for arrays in the style of [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)). For the `'object'` format, groupby keys are coerced to strings to use as object property names; note that this can lead to undesirable behavior if the groupby key values do not coerce to unique strings. The `'map'` and `'entries'` options preserve the groupby key values.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).objects()
// [ { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 6 } ]
```

```js
aq.table({ k: ['a', 'b', 'a'], v: [1, 2, 3] })
  .groupby('k')
  .objects({ grouped: true })
// new Map([
//   [ 'a', [ { k: 'a', v: 1 }, { k: 'a', v: 3 } ] ],
//   [ 'b', [ { k: 'b', v: 2 } ] ]
// ])
```

<hr/><a id="object" href="#object">#</a>
<em>table</em>.<b>object</b>([<i>row</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an object representing a single table row. The *row* index is relative to any filtering and ordering criteria, not the internal data layout. If the *row* index is not specified, the first row in the table (index `0`) is returned.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).object(1) // { a: 2, b : 5}
```

```js
const { min, max } = aq.table({ v: [1, 2, 3] })
  .rollup({ min: op.min('v'), max: op.max('v') })
  .object(); // { min: 1, max: 3 }
```

<hr/><a id="@@iterator" href="#@@iterator">#</a>
<em>table</em>\[<b>Symbol.iterator</b>\]() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Returns an iterator over generated row objects. Similar to the [objects](#objects) method, this method generates new row object instances; however, rather than returning an array, this method provides an iterator over row objects for each non-filtered row in the table.

*Examples*

```js
for (const rowObject of table) {
  // do something with row object
}
```

```js
// slightly less efficient version of table.objects()
const objects = [...table];
```

<hr/><a id="print" href="#print">#</a>
<em>table</em>.<b>print</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/Table.js)

Print the contents of this table using the `console.table()` method.

* *options*: Options for printing. If number-valued, specifies the row limit (equivalent to `{ limit: value }`).
  * *limit*: The maximum number of rows to print (default `10`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: An ordered set of columns to print. The input may consist of: column name strings, column integer indices, objects with current column names as keys and new column names as values (for renaming), or a selection helper function such as [all](#all), [not](#not), or [range](#range)).

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).print()
// ┌─────────┬───┬───┐
// │ (index) │ a │ b │
// ├─────────┼───┼───┤
// │    0    │ 1 │ 4 │
// │    1    │ 2 │ 5 │
// │    2    │ 3 │ 6 │
// └─────────┴───┴───┘
```

<hr/><a id="toHTML" href="#toHTML">#</a>
<em>table</em>.<b>toHTML</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-html.js)

Format this table as an HTML table string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `100`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to print. If function-valued, the function should accept a table as input and return an array of column name strings. Otherwise, should be an array of name strings.
  * *align*: Object of column alignment options. The object keys should be column names. The object values should be aligment strings, one of `'l'` (left), `'c'` (center), or `'r'` (right). If specified, these override any automatically inferred options.
  * *format*: Object of column format options. If specified, these override any automatically inferred options. The object keys should be column names. The object values should either be formatting functions or objects with any of the following properties:
    * *utc*: A boolean flag indicating if UTC date formatting should be used rather than the local time zone.
    * *digits*: Number of fractional digits to include for numbers.
  * *maxdigits*: The maximum number of fractional digits to include when inferring a number format (default `6`). This option is passed to the format inference method and is ignored when explicit format options are specified.
  * *null*: Optional format function for `null` and `undefined` values. If specified, this function be invoked with the `null` or `undefined` value as the sole input argument. The return value is then used as the HTML output for the input value.
  * *style*: CSS styles to include in HTML output. The object keys can be HTML table tag names: `'table'`, `'thead'`, `'tbody'`, `'tr'`, `'th'`, or `'td'`. The object values should be strings of valid CSS style directives (such as `"font-weight: bold;"`) or functions that take a column name and row as input and return a CSS string.

*Examples*

```js
// serialize a table as HTML-formatted text
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toHTML()
```

<hr/><a id="toMarkdown" href="#toMarkdown">#</a>
<em>table</em>.<b>toMarkdown</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-markdown.js)

Format this table as a [GitHub-Flavored Markdown table](https://github.github.com/gfm/#tables-extension-) string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `100`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to print. If function-valued, the function should accept a table as input and return an array of column name strings. Otherwise, should be an array of name strings.
  * *align*: Object of column alignment options. The object keys should be column names. The object values should be aligment strings, one of `'l'` (left), `'c'` (center), or `'r'` (right). If specified, these override any automatically inferred options.
  * *format*: Object of column format options. If specified, these override any automatically inferred options. The object keys should be column names. The object values should either be formatting functions or objects with any of the following properties:
    * *utc*: A boolean flag indicating if UTC date formatting should be used rather than the local time zone.
    * *digits*: Number of fractional digits to include for numbers.
  * *maxdigits*: The maximum number of fractional digits to include when inferring a number format (default `6`). This option is passed to the format inference method and is ignored when explicit format options are specified.

*Examples*

```js
// serialize a table as Markdown-formatted text
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toMarkdown()
// '|a|b|\n|-:|-:|\n|1|4|\n|2|5|\n|3|6|\n'
```

<hr/><a id="toArrow" href="#toArrow">#</a>
<em>table</em>.<b>toArrow</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-arrow.js)

Format this table as an [Apache Arrow](https://arrow.apache.org/overview/) table instance using [Flechette](https://idl.uw.edu/flechette/). This method will throw an error if type inference fails or if the generated columns have differing lengths.

* *options*: Options for Arrow encoding.
  * *columns*: Ordered list of column names to include. If function-valued, the function should accept this table as a single argument and return an array of column name strings.
  * *limit*: The maximum number of rows to include (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *types*: An optional object indicating the [Arrow data type](https://idl.uw.edu/flechette/api/data-types) to use for named columns. If specified, the input should be an object with column names for keys and Arrow data types for values. Type values must be instantiated Flechette [DataType](https://idl.uw.edu/flechette/api/data-types) instances (for example, `float64()`,`dateDay()`, `list(int32())` *etc.*). If a column's data type is not explicitly provided, type inference will be performed.
  * *useBigInt*: Boolean flag (default `false`) to extract 64-bit integer types as JavaScript `BigInt` values. For Flechette tables, the default is to coerce 64-bit integers to JavaScript numbers and raise an error if the number is out of range. This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.
  * *useDate*: Boolean flag (default `true`) to convert Arrow date and timestamp values to JavaScript Date objects. Otherwise, numeric timestamps are used. This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.
  * *useDecimalBigInt*: Boolean flag (default `false`) to extract Arrow decimal-type data as BigInt values, where fractional digits are scaled to integers. Otherwise, decimals are (sometimes lossily) converted to floating-point numbers (default). This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.
  * *useMap*: Boolean flag (default `false`) to represent Arrow Map data as JavaScript `Map` values. For Flechette tables, the default is to produce an array of `[key, value]` arrays. This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.
  * *useProxy*: Boolean flag (default `false`) to extract Arrow Struct values and table row objects using zero-copy proxy objects that extract data from underlying Arrow batches. The proxy objects can improve performance and reduce memory usage, but do not support property enumeration (`Object.keys`, `Object.values`, `Object.entries`) or spreading (`{ ...object }`). This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.

*Examples*

Encode Arrow data from an input Arquero table:

```js
import { float32, uint16 } from '@uwdata/flechette';
import { table } from 'arquero';

// create Arquero table
const dt = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
});

// encode as an Arrow table (infer data types)
// here, infers Uint8 for 'x' and Float64 for 'y'
const at1 = dt.toArrow();

// encode into Arrow table (set explicit data types)
const at2 = dt.toArrow({
  types: {
    x: uint16(),
    y: float32()
  }
});
```

<hr/><a id="toArrowIPC" href="#toArrowIPC">#</a>
<em>table</em>.<b>toArrowIPC</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-arrow-ipc.js)

Format this table as binary data in the [Apache Arrow](https://arrow.apache.org/overview/) IPC format using [Flechette](https://idl.uw.edu/flechette/). The binary data may be saved to disk or passed between processes or tools. For example, when using [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), the output of this method can be passed directly between threads (no data copy) as a [Transferable](https://developer.mozilla.org/en-US/docs/Web/API/Transferable) object. Additionally, Arrow binary data can be loaded in other language environments such as [Python](https://arrow.apache.org/docs/python/) or [R](https://arrow.apache.org/docs/r/).

This method will throw an error if type inference fails or if the generated columns have differing lengths.

* *options*: Options for Arrow encoding, same as [toArrow](#toArrow) but with an additional *format* option.
  * *format*: The Arrow IPC byte format to use. One of `'stream'` (default) or `'file'`. For more details on these formats, see the [Apache Arrow format documentation](https://arrow.apache.org/docs/format/Columnar.html#ipc-streaming-format).

*Examples*

Encode Arrow data from an input Arquero table:

```js
import { table } from 'arquero';

const dt = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
});

// encode table as a transferable Arrow byte buffer
// here, infers int8 for 'x' and float64 for 'y'
const bytes = dt.toArrowIPC();
```

<hr/><a id="toCSV" href="#toCSV">#</a>
<em>table</em>.<b>toCSV</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-csv.js)

Format this table as a comma-separated values (CSV) string. Other delimiters, such as tabs or pipes ('\|'), can be specified using the *options* argument.

* *options*: A formatting options object:
  * *delimiter*: The delimiter between values (default `","`).
  * *header*: Boolean flag (default `true`) to specify the presence of a header row. If `true`, includes a header row with column names. If `false`, the header is omitted.
  * *limit*: The maximum number of rows to print (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to include. If function-valued, the function should accept a table as input and return an array of column name strings. Otherwise, should be an array of name strings.
  * *format*: Object of column format options. The object keys should be column names. The object values should be formatting functions that transform column values prior to output. If specified, a formatting function overrides any automatically inferred options.

*Examples*

```js
// serialize a table as CSV-formatted text
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toCSV()
// 'a,b\n1,4\n2,5\n3,6'
```

<hr/><a id="toJSON" href="#toJSON">#</a>
<em>table</em>.<b>toJSON</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-json.js)

Format this table as a JavaScript Object Notation (JSON) string compatible with the [fromJSON](/#fromJSON) method.

* *options*: A formatting options object:
  * *type* (`'columns' | 'rows' | 'ndjson' | null`): The JSON format type. One of `'columns'` (for an object with named column arrays)`, 'rows'` (for an array for row objects), or `'ndjson'` for [newline-delimited JSON](https://github.com/ndjson/ndjson-spec) rows. For `'ndjson'`, each line of text will contain a JSON row object (with no trailing comma) and string properties will be stripped of any newline characters. If no format type is specified, defaults to `'rows'`.
  * *limit* (`number`): The maximum number of rows to print (default `Infinity`).
  * *offset* (`number`): The row offset indicating how many initial rows to skip (default `0`).
  * *columns* (`string[] | function`): Ordered list of column names to include. If function-valued, the function should accept a table as input and return an array of column name strings. Otherwise, should be an array of name strings.
  * *format* (`Record<string, function>`): Object of column format options. The object keys should be column names. The object values should be formatting functions that transform column values prior to output. If specified, a formatting function overrides any automatically inferred options.

*JSON Format Types*

`'columns'`: column-oriented JSON as an object-of-arrays.

```json
{
  "colA": ["a", "b", "c"],
  "colB": [1, 2, 3]
}
```

`'rows'`: row-oriented JSON as an array-of-objects.

```json
[
  {"colA": "a", "colB": 1},
  {"colA": "b", "colB": 2},
  {"colA": "c", "colB": 3}
]
```

`'ndjson'`: newline-delimited JSON as individual objects separated by newline.

```json
{"colA": "a", "colB": 1}
{"colA": "b", "colB": 2}
{"colA": "c", "colB": 3}
```

*Examples*

```js
// serialize a table as a row-oriented JSON string
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toJSON()
// '[{"a":1,"b":4},{"a":2,"b":5},{"a":3,"b":6}]'
```

```js
// serialize a table as a column-oriented JSON string
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toJSON({ type: 'columns' })
// '{"a":[1,2,3],"b":[4,5,6]}'
```

```js
// serialize a table as a newline-delimited JSON string
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toJSON({ type: 'ndjson' })
// '{"a":1,"b":4}\n{"a":2,"b":5}\n{"a":3,"b":6}'
```

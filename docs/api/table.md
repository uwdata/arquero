---
title: Table \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [**Table**](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions) | [Extensibility](extensibility)

* [Table Metadata](#metadata)
  * [numCols](#numCols), [numRows](#numRows), [totalRows](#totalRows)
  * [isFiltered](#isFiltered), [isGrouped](#isGrouped), [isOrdered](#isOrdered)
  * [comparator](#foo), [groups](#groups), [mask](#mask)
  * [params](#params)
* [Table Columns](#columns)
  * [column](#column), [columnAt](#columnAt), [columnIndex](#columnIndex)
  * [columnName](#columnName), [columnNames](#columnNames)
  * [assign](#assign)
* [Table Values](#values)
  * [data](#data), [get](#get), [getter](#getter)
  * [indices](#indices), [partitions](#partitions), [scan](#scan)
* [Table Output](#output)
  * [objects](#objects), [Symbol.iterator](#@@iterator), [print](#print)
  * [toArrow](#toArrow), [toCSV](#toCSV), [toHTML](#toHTML), [toJSON](#toJSON), [toMarkdown](#toMarkdown)


<br/>

## <a id="metadata">Table Metadata</a>

<hr/><a id="numCols" href="#numCols">#</a>
<em>table</em>.<b>numCols</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The number of columns in this table.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .numCols() // 2
```

<hr/><a id="numRows" href="#numRows">#</a>
<em>table</em>.<b>numRows</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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

<hr/><a id="totalRows" href="#totalRows">#</a>
<em>table</em>.<b>totalRows</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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
<em>table</em>.<b>isFiltered</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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
<em>table</em>.<b>isGrouped</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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
<em>table</em>.<b>isOrdered</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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
<em>table</em>.<b>comparator</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns the row order comparator function, if specified.

<hr/><a id="groups" href="#groups">#</a>
<em>table</em>.<b>groups</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns the groupby specification, if defined. A groupby specification is an object with the following properties:

* *names*: Output column names for each group field.
* *get*: Value accessor functions for each group field.
* *rows*: Row indices of example table rows for each group.
* *size*: The total number of groups.
* *keys*: Per-row group indices for every row in the table.

<hr/><a id="mask" href="#mask">#</a>
<em>table</em>.<b>mask</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns the bitset mask for filtered rows, or null if there is no filter.

<hr/><a id="params" href="#params">#</a>
<em>table</em>.<b>params</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/transformable.js)

Get or set table expression parameter values. If called with no arguments, returns the current parameter values as an object. Otherwise, adds the provided parameters to this table's parameter set and returns the table. Any prior parameters with names matching the input parameters are overridden.

* *values*: A set of parameter values to add as an object of name-value pairs.

*Examples*

```js
table.params({ hi: 5 }).filter((d, $) => abs(d.value) < $.hi)
```


<br/>

## <a id="columns">Table Columns</a>

<hr/><a id="column" href="#column">#</a>
<em>table</em>.<b>column</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Get the column instance with the given name, or `undefined` if does not exist. The returned column object provides a lightweight abstraction over the column storage (such as a backing array), providing a *length* property and *get(row)* method.

* *name*: The column name.

*Examples*

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
dt.column('b').get(1) // 5
```

<hr/><a id="columnAt" href="#columnAt">#</a>
<em>table</em>.<b>columnAt</b>(<i>index</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Get the column instance at the given index position, or `undefined` if does not exist. The returned column object provides a lightweight abstraction over the column storage (such as a backing array), providing a *length* property and *get(row)* method.

* *index*: The zero-based column index.

*Examples*

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
dt.columnAt(1).get(1) // 5
```

<hr/><a id="columnIndex" href="#columnIndex">#</a>
<em>table</em>.<b>columnIndex</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The column index for the given name, or `-1` if the name is not found.

* *name*: The column name.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .columnIndex('b'); // 1
```

<hr/><a id="columnName" href="#columnName">#</a>
<em>table</em>.<b>columnName</b>(<i>index</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The column name at the given index, or `undefined` if the index is out of range.

* *index*: The column index.

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] })
  .columnName(1); // 'b'
```

<hr/><a id="columnNames" href="#columnNames">#</a>
<em>table</em>.<b>columnNames</b>([<i>filter</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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

<hr/><a id="assign" href="#assign">#</a>
<em>table</em>.<b>assign</b>(<i>...tables</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Create a new table with additional columns drawn from one or more input *tables*. All tables must have the same numer of rows and will be [reified](verbs/#reify) prior to assignment. In the case of repeated column names, input table columns overwrite existing columns.

* *tables*: The input tables to merge.

*Examples*

```js
const t1 = aq.table({ a: [1, 2], b: [3, 4] });
const t2 = aq.table({ c: [5, 6], b: [7, 8] });
t1.assign(t2); // { a: [1, 2], b: [7, 8], c: [5, 6] }
```

<br/>

## <a id="values">Table Values</a>

<hr/><a id="data" href="#data">#</a>
<em>table</em>.<b>data</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns the internal table storage data structure.

<hr/><a id="get" href="#get">#</a>
<em>table</em>.<b>get</b>(<i>name</i>, <i>row</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Get the value for the given column and row. Row indices are relative to the [total rows](#totalRows), not the number of [filtered rows](#numRows).

* *name*: The column name.
* *row*: The row index.

*Examples*

```js
const dt = aq.table({ a: [1, 2, 3], b: [4, 5, 6] });
dt.get('a', 0) // 1
dt.get('a', 2) // 3
```

<hr/><a id="getter" href="#getter">#</a>
<em>table</em>.<b>getter</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Returns an accessor ("getter") function for a column. The returned function takes a row index as its single argument and returns the corresponding column value. Row indices are relative to the [total rows](#totalRows), not the number of [filtered rows](#numRows).

*Examples*

```js
const get = aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).getter('a');
get(0) // 1
get(2) // 3
```

* *name*: The column name.

<hr/><a id="indices" href="#indices">#</a>
<em>table</em>.<b>indices</b>([<i>order</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns an array of indices for all rows passing the table filter.

* *order*: A boolean flag (default `true`) indicating if the returned indices should be sorted if this table is ordered. If `false`, the returned indices may or may not be sorted.

<hr/><a id="partitions" href="#partitions">#</a>
<em>table</em>.<b>partitions</b>([<i>order</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns an array of indices for each group in the table. If the table is not grouped, the result is the same as [indices](#indices), but wrapped within an array. Otherwise returns an array of row index arrays, one per group. The indices will be filtered if the table has been filtered.

* *order*: A boolean flag (default `true`) indicating if the returned indices should be sorted if this table is ordered. If `false`, the returned indices may or may not be sorted.

<hr/><a id="scan" href="#scan">#</a>
<em>table</em>.<b>scan</b>(<i>callback</i>[, <i>order</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Perform a table scan, invoking the provided *callback* function for each row of the table. If this table is filtered, only rows passing the filter are visited.

* *callback*: Function invoked for each row of the table. The callback is invoked with the following arguments:
  * *row*: The table row index.
  * *data*: The backing table data store.
  * *stop*: A function to stop the scan early. The callback can invoke *stop()* to prevent future scan calls.
* *order*: A boolean flag (default `false`), indicating if the table should be scanned in the order determined by [orderby](verbs#orderby). This argument has no effect if the table is unordered.


<br/>

## <a id="output">Table Output</a>

<hr/><a id="objects" href="#objects">#</a>
<em>table</em>.<b>objects</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Returns an array of objects representing table rows. A new set of objects will be created, copying the backing table data.

* *options*: Options for row generation:
  * *limit*: The maximum number of objects to create (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).

*Examples*

```js
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).objects()
// [ { a: 1, b: 4 }, { a: 2, b: 5 }, { a: 3, b: 6 } ]
```

<hr/><a id="@@iterator" href="#@@iterator">#</a>
<em>table</em>\[<b>Symbol.iterator</b>\]() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

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
<em>table</em>.<b>print</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Print the contents of this table using the `console.table()` method.

* *options*: Options for printing. If number-valued, specifies the row limit (equivalent to `{ limit: value }`).
  * *limit*: The maximum number of rows to print (default `10`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).

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

<a id="toArrow" href="#toArrow">#</a>
<em>table</em>.<b>toArrow</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/arrow/encode/index.js)

Format this table as an [Apache Arrow](https://arrow.apache.org/docs/js/) table instance. This method will throw an error if type inference fails or if the generated columns have differing lengths.

* *options*: Options for Arrow encoding.
  * *columns*: Ordered list of column names to include. If function-valued, the function should accept this table as a single argument and return an array of column name strings.
  * *limit*: The maximum number of rows to include (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *types*: An optional object indicating the [Arrow data type](https://arrow.apache.org/docs/js/enums/type.html) to use for named columns. If specified, the input should be an object with column names for keys and Arrow data types for values. If a column's data type is not explicitly provided, type inference will be performed.

    Type values can either be instantiated Arrow [DataType](https://arrow.apache.org/docs/js/classes/datatype.html) instances (for example, `new Float64()`,`new DateMilliseconds()`, *etc.*) or type enum codes (`Type.Float64`, `Type.Date`, `Type.Dictionary`). For convenience, arquero re-exports the apache-arrow `Type` enum object (see examples below). High-level types map to specific data type instances as follows:

    * `Type.Date` → `new DateMilliseconds()`
    * `Type.Dictionary` → `new Dictionary(new Utf8(), new Int32())`
    * `Type.Float` → `new Float64()`
    * `Type.Int` → `new Int32()`
    * `Type.Interval` → `new IntervalYearMonth()`
    * `Type.Time` → `new TimeMillisecond()`

    Types that require additional parameters (including `List`, `Struct`, and `Timestamp`) can not be specified using type codes. Instead, use data type constructors from apache-arrow, such as `new List(new Int32())`.

*Examples*

Encode Arrow data from an input Arquero table:

```js
const { table, Type } = require('arquero');

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
    x: Type.Uint16,
    y: Type.Float32
  }
});
```

<a id="toArrowBuffer" href="#toArrow">#</a>
<em>table</em>.<b>toArrowBuffer</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/arrow/encode/index.js)

Format this table as binary data in the [Apache Arrow](https://arrow.apache.org/docs/js/) IPC format. The binary data may be saved to disk or passed between processes or tools. For example, when using [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), the output of this method can be passed directly between threads (no data copy) as a [Transferable](https://developer.mozilla.org/en-US/docs/Web/API/Transferable) object. Additionally, Arrow binary data can be loaded in other language environments such as [Python](https://arrow.apache.org/docs/python/) or [R](https://arrow.apache.org/docs/r/).

This method will throw an error if type inference fails or if the generated columns have differing lengths. This method is a shorthand for `table.toArrow().serialize()`.

* *options*: Options for Arrow encoding, same as [toArrow](#toArrow).

*Examples*

Encode Arrow data from an input Arquero table:

```js
const { table } = require('arquero');

const dt = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
});

// encode table as a transferable Arrow byte buffer
// here, infers Uint8 for 'x' and Float64 for 'y'
const bytes = dt.toArrowBuffer();
```

<hr/><a id="toCSV" href="#toCSV">#</a>
<em>table</em>.<b>toCSV</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-csv.js)

Format this table as a comma-separated values (CSV) string. Other delimiters, such as tabs or pipes ('\|'), can be specified using the *options* argument.

* *options*: A formatting options object:
  * *delimiter*: The delimiter between values (default `","`).
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

<hr/><a id="toHTML" href="#toHTML">#</a>
<em>table</em>.<b>toHTML</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-html.js)

Format this table as an HTML table string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `Infinity`).
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

<hr/><a id="toJSON" href="#toJSON">#</a>
<em>table</em>.<b>toJSON</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-json.js)

Format this table as a JavaScript Object Notation (JSON) string compatible with the [fromJSON](/#fromJSON) method.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *schema*: Boolean flag (default `true`) indicating if table schema metadata should be included in the JSON output. If `false`, only the data payload is included.
  * *columns*: Ordered list of column names to print. If function-valued, the function should accept a table as input and return an array of column name strings. Otherwise, should be an array of name strings.
  * *format*: Object of column format options. The object keys should be column names. The object values should be formatting functions that transform column values prior to output. If specified, a formatting function overrides any automatically inferred options.

*Examples*

```js
// serialize a table as a JSON string with schema metadata
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toJSON()
// '{"schema":{"fields":[{"name":"a"},{"name":"b"}]},"data":{"a":[1,2,3],"b":[4,5,6]}}'
```

```js
// serialize a table as a JSON string without schema metadata
aq.table({ a: [1, 2, 3], b: [4, 5, 6] }).toJSON({ schema: false })
// '{"a":[1,2,3],"b":[4,5,6]}'
```

<hr/><a id="toMarkdown" href="#toMarkdown">#</a>
<em>table</em>.<b>toMarkdown</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-markdown.js)

Format this table as a [GitHub-Flavored Markdown table](https://github.github.com/gfm/#tables-extension-) string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `Infinity`).
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
---
title: Table \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [**Table**](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions)

* [Table Metadata](#metadata)
  * [numCols](#numCols), [numRows](#numRows), [totalRows](#totalRows)
  * [isFiltered](#isFiltered), [isGrouped](#isGrouped), [isOrdered](#isOrdered)
  * [comparator](#foo), [groups](#groups)
  * [params](#params)
* [Table Columns](#columns)
  * [column](#column), [columnAt](#columnAt)
  * [columnIndex](#columnIndex), [columnName](#columnName)
  * [columnNames](#columnNames)
* [Table Values](#values)
  * [data](#data), [get](#get), [getter](#getter)
  * [indices](#indices), [partitions](#partitions), [scan](#scan)
* [Table Output](#output)
  * [objects](#objects), [Symbol.iterator](#@@iterator), [print](#print)
  * [toCSV](#toCSV), [toHTML](#toHTML), [toJSON](#toJSON), [toMarkdown](#toMarkdown)


<br/>

## <a id="metadata">Table Metadata</a>

<hr/><a id="numCols" href="#numCols">#</a>
<em>table</em>.<b>numCols</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The number of columns in this table.

<hr/><a id="numRows" href="#numRows">#</a>
<em>table</em>.<b>numRows</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The number of active (non-filtered) rows in this table. This number may be less than the [total rows](#totalRows) if the table has been filtered.

<hr/><a id="totalRows" href="#totalRows">#</a>
<em>table</em>.<b>totalRows</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The total number of rows in this table, including both filtered and unfiltered rows.

<hr/><a id="isFiltered" href="#isFiltered">#</a>
<em>table</em>.<b>isFiltered</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Indicates if the table has a filter applied.

<hr/><a id="isGrouped" href="#isGrouped">#</a>
<em>table</em>.<b>isGrouped</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Indicates if the table has a groupby specification.

<hr/><a id="isOrdered" href="#isOrdered">#</a>
<em>table</em>.<b>isOrdered</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Indicates if the table has a row order comparator.

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

<hr/><a id="params" href="#params">#</a>
<em>table</em>.<b>params</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

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

<hr/><a id="columnAt" href="#columnAt">#</a>
<em>table</em>.<b>columnAt</b>(<i>index</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Get the column instance at the given index position, or `undefined` if does not exist. The returned column object provides a lightweight abstraction over the column storage (such as a backing array), providing a *length* property and *get(row)* method.

* *index*: The zero-based column index.

<hr/><a id="columnIndex" href="#columnIndex">#</a>
<em>table</em>.<b>columnIndex</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The column index for the given name, or `-1` if the name is not found.

* *name*: The column name.

<hr/><a id="columnName" href="#columnName">#</a>
<em>table</em>.<b>columnName</b>(<i>index</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

The column name at the given index, or `undefined` if the index is out of range.

* *index*: The column index.

<hr/><a id="columnNames" href="#columnNames">#</a>
<em>table</em>.<b>columnNames</b>([<i>filter</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/table.js)

Returns an array of table column names, optionally filtered.

* *filter*: An optional filter callback function. If unspecified, all column names are returned. If *filter* is provided, it will be invoked for each column name and only those for which the callback returns a [truthy](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) value will be kept. The filter callback function is called with the following arguments:
  * *name*: The column name.
  * *index*: The column index.
  * *array*: The backing array of names.


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

<hr/><a id="getter" href="#getter">#</a>
<em>table</em>.<b>getter</b>(<i>name</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Returns an accessor ("getter") function for a column. The returned function takes a row index as its single argument and returns the corresponding column value. Row indices are relative to the [total rows](#totalRows), not the number of [filtered rows](#numRows).

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

<hr/><a id="@@iterator" href="#@@iterator">#</a>
<em>table</em>\[<b>Symbol.iterator</b>\]() · [Source](https://github.com/uwdata/arquero/blob/master/src/table/column-table.js)

Returns an iterator over generated row objects. Similar to the [objects](#objects) method, this method generates new row object instances; however, rather than returning an array, this method provides an iterator over row objects for each active row in the table.

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

* *options*: Options for printing, typically an object value. If number-valued, the call is equivalent to `{ limit: value }`.
  * *limit*: The maximum number of rows to print (default `10`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).

<hr/><a id="toCSV" href="#toCSV">#</a>
<em>table</em>.<b>toCSV</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-csv.js)

Format this table as a comma-separated values (CSV) string. Other delimiters, such as tabs or pipes ('\|'), can be specified using the options argument.

* *options*: A formatting options object:
  * *delimiter*: The delimiter between values (default `","`).
  * *limit*: The maximum number of rows to print (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to include. If function-valued, the function should accept a table as input and return an array of column name strings.
  * *format*: Object of column format options. The object keys should be column names. The object values should be formatting functions to invoke to transform column values prior to output. If specified, a formatting function overrides any automatically inferred options.

<hr/><a id="toHTML" href="#toHTML">#</a>
<em>table</em>.<b>toHTML</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-csv.js)

Format this table as an HTML table string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to print. If function-valued, the function should accept a table as input and return an array of column name strings.
  * *align*: Object of column alignment options. The object keys should be column names. The object values should be aligment strings, one of `'l'` (left), `'c'` (center), or `'r'` (right). If specified, these override any automatically inferred options.
  * *format*: Object of column format options. The object keys should be column names. The object values should be formatting functions or objects with any of the following properties.If specified, these override any automatically inferred options:
    * *date*: One of 'utc' or 'loc' (for UTC or local dates), or `null` for complete date time strings.
    * *digits*: Number of significant digits to include for numbers.
  * *null*: Optional format function for `null` and `undefined` values. If specified, this function be invoked with the `null` or `undefined` value as the sole input argument. The return value is then used as the HTML output for the input value.
  * *style*: CSS styles to include in HTML output. The object keys can be HTML table tag names: `'table'`, `'thead'`, `'tbody'`, `'tr'`, `'th'`, or `'td'`. The object values should be strings of valid CSS style directives (such as `"font-weight: bold;"`) or functions that take a column name and row as inputs and return a CSS string.

<hr/><a id="toJSON" href="#toJSON">#</a>
<em>table</em>.<b>toJSON</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-json.js)

Format this table as a JavaScript Object Notation (JSON) string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to print. If function-valued, the function should accept a table as input and return an array of column name strings.
  * *format*: Object of column format options. The object keys should be column names. The object values should be formatting functions to invoke to transform column values prior to output. If specified, a formatting function overrides any automatically inferred options.

<hr/><a id="toMarkdown" href="#toMarkdown">#</a>
<em>table</em>.<b>toMarkdown</b>([<i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/to-json.js)

Format this table as a [GitHub-Flavored Markdown table](https://github.github.com/gfm/#tables-extension-) string.

* *options*: A formatting options object:
  * *limit*: The maximum number of rows to print (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *columns*: Ordered list of column names to print. If function-valued, the function should accept a table as input and return an array of column name strings.
  * *align*: Object of column alignment options. The object keys should be column names. The object values should be aligment strings, one of `'l'` (left), `'c'` (center), or `'r'` (right). If specified, these override any automatically inferred options.
  * *format*: Object of column format options. The object keys should be column names. The object values should be formatting functions or objects with any of the following properties.If specified, these override any automatically inferred options:
    * *date*: One of 'utc' or 'loc' (for UTC or local dates), or `null` for complete date time strings.
    * *digits*: Number of significant digits to include for numbers.

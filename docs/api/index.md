---
title: Arquero API Reference
---
# Arquero API Reference <a href="https://idl.uw.edu/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[**Top-Level**](/arquero/api) | [Table](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions) | [Extensibility](extensibility)

* [Table Constructors](#table-constructors)
  * [table](#table), [from](#from), [fromArrow](#fromArrow), [fromCSV](#fromCSV), [fromFixed](#fromFixed), [fromJSON](#fromJSON)
* [Table Input](#input)
  * [load](#load), [loadArrow](#loadArrow), [loadCSV](#loadCSV), [loadFixed](#loadFixed), [loadJSON](#loadJSON)
* [Table Output](#output)
  * [toArrow](#toArrow), [toArrowIPC](#toArrowIPC)
* [Expression Helpers](#expression-helpers)
  * [op](#op), [agg](#agg), [escape](#escape)
  * [bin](#bin), [desc](#desc), [frac](#frac), [rolling](#rolling), [seed](#seed)
* [Selection Helpers](#selection-helpers)
  * [all](#all), [not](#not), [range](#range)
  * [matches](#matches), [startswith](#startswith), [endswith](#endswith)
  * [names](#names)


<br/>

## <a id="table-constructors">Table Constructors</a>

Methods for creating new table instances.

<hr/><a id="table" href="#table">#</a>
<em>aq</em>.<b>table</b>(<i>columns</i>[, <i>names</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/index.js)

Create a new <a href="table">table</a> for a set of named *columns*, optionally including an array of ordered column *names*. The *columns* input can be an object or Map with names for keys and columns for values, or an entry array of `[name, values]` tuples.

JavaScript objects have specific key ordering rules: keys are enumerated in the order they are assigned, except for integer keys, which are enumerated first in sorted order. As a result, when using a standard object any *columns* entries with integer keys are listed first regardless of their order in the object definition. Use the *names* argument to ensure proper column ordering is respected. Map and entry arrays will preserve name ordering, in which case the *names* argument is only needed if you wish to specify an ordering different from the *columns* input.

To bind together columns from multiple tables with the same number of rows, use the table [assign](table#assign) method. To transform the table, use the various [verb](verbs) methods.

* *columns*: An object or Map providing a named set of column arrays, or an entries array of the form `[[name, values], ...]`. Keys are column name strings; the enumeration order of the keys determines the column indices if the *names* argument is not provided. Column values should be arrays (or array-like values) of identical length.
* *names*: An array of column names, specifying the index order of columns in the table.

*Examples*

```js
// create a new table with 2 columns and 3 rows
aq.table({ colA: ['a', 'b', 'c'], colB: [3, 4, 5] })
```

```js
// create a new table, preserving column order for integer names
aq.table({ key: ['a', 'b'], 1: [9, 8], 2: [7, 6] }, ['key', '1', '2'])
```

```js
// create a new table from a Map instance
const map = new Map()
  .set('colA', ['a', 'b', 'c'])
  .set('colB', [3, 4, 5]);
aq.table(map)
```


<hr/><a id="from" href="#from">#</a>
<em>aq</em>.<b>from</b>(<i>values</i>[, <i>names</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/index.js)

Create a new <a href="table">table</a> from an existing object, such as an array of objects or a set of key-value pairs.

* *values*: Data values to populate the table. If array-valued or iterable, imports rows for each non-null value, using the provided column names as keys for each row object. If no *names* are provided, the first non-null object's own keys are used. If an object or a Map, create a two-column table with columns for the input keys and values.
* *names*: Column names to include. For object or Map inputs, specifies the key and value column names. Otherwise, specifies the keys to look up on each row object.

*Examples*

```js
// from an array, create a new table with two columns and two rows
// akin to table({ colA: [1, 3], colB: [2, 4] })
aq.from([ { colA: 1, colB: 2 }, { colA: 3, colB: 4 } ])
```

```js
// from an object, create a new table with 'key' and 'value columns
// akin to table({ key: ['a', 'b', 'c'], value: [1, 2, 3] })
aq.from({ a: 1, b: 2, c: 3 })
```

```js
// from a Map, create a new table with 'key' and 'value' columns
// akin to table({ key: ['d', 'e', 'f'], value: [4, 5, 6] })
aq.from(new Map([ ['d', 4], ['e', 5], ['f', 6] ])
```


<hr/><a id="fromArrow" href="#fromArrow">#</a>
<em>aq</em>.<b>fromArrow</b>(<i>arrowTable</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-arrow.js)

Create a new <a href="table">table</a> backed by [Apache Arrow](https://arrow.apache.org/) binary data. The input *arrowTable* can be a byte array in the Arrow IPC format or an instantiated [Flechette](https://github.com/uwdata/flechette) or [Apache Arrow JS](https://arrow.apache.org/docs/js/) table instance. Byte array inputs are decoded using [Flechette](https://github.com/uwdata/flechette).

For many data types, Arquero uses binary-encoded Arrow columns as-is with zero data copying. For dictionary columns, Arquero unpacks columns with `null` entries or containing multiple record batches to optimize query performance.

This method performs parsing only. To both load and parse an Arrow file, use [loadArrow](#loadArrow).

* *arrowTable*: A byte array (e.g., [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) or [Uint8Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)) in the Arrow IPC format or a [Flechette](https://github.com/uwdata/flechette) or [Apache Arrow JS](https://arrow.apache.org/docs/js/) table instance.
* *options*: An Arrow import options object:
  * *columns*: An ordered set of columns to import. The input may consist of: column name strings, column integer indices, objects with current column names as keys and new column names as values (for renaming), or a selection helper function such as [all](#all), [not](#not), or [range](#range)).
  * *useDate*: Boolean flag (default `true`) to convert Arrow date and timestamp values to JavaScript Date objects. Otherwise, numeric timestamps are used. This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.
  * *useBigInt*: Boolean flag (default `false`) to represent Arrow 64-bit integers as JavaScript `BigInt` values. For Flechette tables, the default is to coerce 64-bit integers to JavaScript numbers. This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.
  * *useMap*: Boolean flag (default `false`) to represent Arrow Map data as JavaScript `Map` values. For Flechette tables, the default is to produce an array of `[key, value]` arrays. This option is only applied when parsing IPC binary data, otherwise the settings of the provided table instance are used.

*Examples*

```js
// encode input array-of-objects data as an Arrow table
const arrowTable = aq.toArrow([
  { x: 1, y: 3.4 },
  { x: 2, y: 1.6 },
  { x: 3, y: 5.4 },
  { x: 4, y: 7.1 },
  { x: 5, y: 2.9 }
]);

// now access the Arrow-encoded data as an Arquero table
const dt = aq.fromArrow(arrowTable);
```


<hr/><a id="fromCSV" href="#fromCSV">#</a>
<em>aq</em>.<b>fromCSV</b>(<i>text</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-csv.js)

Parse a comma-separated values (CSV) *text* string into a <a href="table">table</a>. Delimiters other than commas, such as tabs or pipes ('\|'), can be specified using the *options* argument. By default, automatic type inference is performed for input values; string values that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior set *options.autoType* to `false`, which will cause all columns to be loaded as strings. To perform custom parsing of input column values, use *options.parse*.

This method performs parsing only. To both load and parse a CSV file, use [loadCSV](#loadCSV).

* *text*: A string in a delimited-value format.
* *options*: A CSV format options object:
  * *delimiter*: A single-character delimiter string between column values (default `','`).
  * *decimal*: A single-character numeric decimal separator (default `'.'`).
  * *header*: Boolean flag (default `true`) to specify the presence of a  header row. If `true`, indicates the CSV contains a header row with column names. If `false`, indicates the CSV does not contain a header row and the columns are given the names `'col1'`, `'col2'`, etc unless the *names* option is specified.
  * *names*: An array of column names to use for header-less CSV files. This option is ignored if the *header* option is `true`.
  * *skip*: The number of lines to skip (default `0`) before reading data.
  * *comment*: A string used to identify comment lines. Any lines that start with the comment pattern are skipped.
  * *autoType*: Boolean flag (default `true`) for automatic type inference.
  * *autoMax*: Maximum number of initial rows (default `1000`) to use for type inference.
  * *parse*: Object of column parsing options. The object keys should be column names. The object values should be parsing functions to invoke to transform values upon input.

*Examples*

```js
// create table from an input CSV string
// akin to table({ a: [1, 3], b: [2, 4] })
aq.fromCSV('a,b\n1,2\n3,4')
```

```js
// skip commented lines
aq.fromCSV('# a comment\na,b\n1,2\n3,4', { comment: '#' })
```

```js
// skip the first line
aq.fromCSV('# a comment\na,b\n1,2\n3,4', { skip: 1 })
```

```js
// override autoType with custom parser for column 'a'
// akin to table({ a: ['00152', '30219'], b: [2, 4] })
aq.fromCSV('a,b\n00152,2\n30219,4', { parse: { a: String } })
```

```js
// parse semi-colon delimited text with comma as decimal separator
aq.fromCSV('a;b\nu;-1,23\nv;3,45e5', { delimiter: ';', decimal: ',' })
```

```js
// create table from an input CSV loaded from 'url'
// alternatively, use the loadCSV method
aq.fromCSV(await fetch(url).then(res => res.text()))
```


<hr/><a id="fromFixed" href="#fromFixed">#</a>
<em>aq</em>.<b>fromFixed</b>(<i>text</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-fixed-width.js)

Parse a fixed-width file *text* string into a <a href="table">table</a>. By default, automatic type inference is performed for input values; string values that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior set *options.autoType* to `false`, which will cause all columns to be loaded as strings. To perform custom parsing of input column values, use *options.parse*.

This method performs parsing only. To both load and parse a fixed-width file, use [loadFixed](#loadFixed).

* *text*: A string in a fixed-width format.
* *options*: A format options object:
  * *positions*: Array of [start, end] indices for fixed-width columns.
  * *widths*: Array of fixed column widths. This option is ignored if the *positions* property is specified.
  * *names*: An array of column names. The array length should match the length of the *positions* or *widths* array. If not specified or shorter than the other array, default column names are generated.
  * *decimal*: A single-character numeric decimal separator (default `'.'`).
  * *skip*: The number of lines to skip (default `0`) before reading data.
  * *comment*: A string used to identify comment lines. Any lines that start with the comment pattern are skipped.
  * *autoType*: Boolean flag (default `true`) for automatic type inference.
  * *autoMax*: Maximum number of initial rows (default `1000`) to use for type inference.
  * *parse*: Object of column parsing options. The object keys should be column names. The object values should be parsing functions to invoke to transform values upon input.

*Examples*

```js
// create table from an input fixed-width string
// akin to table({ u: ['a', 'b'], v: [1, 2] })
aq.fromFixed('a1\nb2', { widths: [1, 1], names: ['u', 'v'] })
```


<hr/><a id="fromJSON" href="#fromJSON">#</a>
<em>aq</em>.<b>fromJSON</b>(<i>data</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-json.js)

Parse JavaScript Object Notation (JSON) *data* into a <a href="table">table</a>. String values in JSON column arrays that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior, set *options.autoType* to `false`. To perform custom parsing of input column values, use *options.parse*. Auto-type Date parsing is not performed for columns with custom parse options.

This method performs parsing only. To both load and parse a JSON file, use [loadJSON](#loadJSON).

The expected JSON data format is an object with column names for keys and column value arrays for values, like so:

```json
{
  "colA": ["a", "b", "c"],
  "colB": [1, 2, 3]
}
```

The data payload can also be provided as the *data* property of an enclosing object, with an optional *schema* property containing table metadata such as a *fields* array of ordered column information:

```json
{
  "schema": {
    "fields": [
      { "name": "colA" },
      { "name": "colB" }
    ]
  },
  "data": {
    "colA": ["a", "b", "c"],
    "colB": [1, 2, 3]
  }
}
```

* *data*: A string in a supported JSON format, or a corresponding Object instance.
* *options*: A JSON format options object:
  * *autoType*: Boolean flag (default `true`) for automatic type inference. If `false`, automatic date parsing for input JSON strings is disabled.
  * *parse*: Object of column parsing options. The object keys should be column names. The object values should be parsing functions to invoke to transform values upon input.

*Examples*

```js
// create table from an input JSON string
// akin to table({ a: [1, 3], b: [2, 4] })
aq.fromJSON('{"a":[1,3],"b":[2,4]}')
```

```js
// create table from an input JSON string
// akin to table({ a: [1, 3], b: [2, 4] }, ['a', 'b'])
aq.fromJSON(`{
  "schema":{"fields":[{"name":"a"},{"name":"b"}]},
  "data":{"a":[1,3],"b":[2,4]}
}`)
```

```js
// create table from an input JSON string loaded from 'url'
aq.fromJSON(await fetch(url).then(res => res.text()))
```

```js
// create table from an input JSON object loaded from 'url'
// disable autoType Date parsing
aq.fromJSON(await fetch(url).then(res => res.json()), { autoType: false })
```


<br/>

## <a id="input">Table Input</a>

Methods for loading files and creating new table instances.

<hr/><a id="load" href="#load">#</a>
<em>aq</em>.<b>load</b>(<i>url</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/load-url.js)

Load data from a *url* or file and return a Promise for a <a href="table">table</a>. A specific format parser can be provided with the *using* option, otherwise CSV format is assumed. This method's *options* are also passed as the second argument to the format parser.

When invoked in the browser, the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used to load the *url*. When invoked in node.js, the *url* argument can also be a local file path. If the input *url* string has a network protocol at the beginning (e.g., `'http://'`, `'https://'`, *etc*.) it is treated as a URL and the [node-fetch](https://github.com/node-fetch/node-fetch) library is used. If the `'file://'` protocol is used, the rest of the string should be an absolute file path, from which a local file is loaded. Otherwise the input is treated as a path to a local file and loaded using the node.js `fs` module.

This method provides a generic base for file loading and parsing, and can be used to customize table parsing. To load CSV data, use the more specific [loadCSV](#loadCSV) method. Similarly,to load JSON data use [loadJSON](#loadJSON) and to load Apache Arrow data use [loadArrow](#loadArrow).

* *url*: The url or local file (node.js only) to load.
* *options*: File loading options.
  * *using*: A function that accepts loaded data and an optional options object as input and returns an Arquero table.
  * *as*: A string indicating the data type of the file. One of `'arrayBuffer'`, `'json'`, or `'text'` (the default).
  * *fetch*: Options to pass to the HTTP [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch) method when loading from a URL.

*Examples*

```js
// load table from a CSV file
const dt = await aq.load('data/table.csv', { using: aq.fromCSV });
```

```js
// load table from a JSON file with column format
const dt = await aq.load('data/table.json', { as: 'json', using: aq.fromJSON })
```

```js
// load table from a JSON file with array-of-objects format
const dt = await aq.load('data/table.json', { as: 'json', using: aq.from })
```


<hr/><a id="loadArrow" href="#loadArrow">#</a>
<em>aq</em>.<b>loadArrow</b>(<i>url</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/load-file.js)

Load a file in the [Apache Arrow](https://arrow.apache.org/docs/js/) IPC format from a *url* and return a Promise for a <a href="table">table</a>.

This method performs both loading and parsing, and is equivalent to `aq.load(url, { as: 'arrayBuffer', using: aq.fromArrow })`. To instead create an Arquero table for an Apache Arrow dataset that has already been loaded, use [fromArrow](#fromArrow).

When invoked in the browser, the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used to load the *url*. When invoked in node.js, the *url* argument can also be a local file path. If the input *url* string has a network protocol at the beginning (e.g., `'http://'`, `'https://'`, *etc*.) it is treated as a URL and the [node-fetch](https://github.com/node-fetch/node-fetch) library is used. If the `'file://'` protocol is used, the rest of the string should be an absolute file path, from which a local file is loaded. Otherwise the input is treated as a path to a local file and loaded using the node.js `fs` module.

* *url*: The url or local file (node.js only) to load.
* *options*: File loading and Arrow formatting options. Accepts the options of both the [load](#load) and [fromArrow](#fromArrow) methods, but ignores any settings for the load *as* and *using* options.

*Examples*

```js
// load table from an Apache Arrow file
const dt = await aq.loadArrow('data/table.arrow');
```


<hr/><a id="loadCSV" href="#loadCSV">#</a>
<em>aq</em>.<b>loadCSV</b>(<i>url</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/load-file.js)

Load a comma-separated values (CSV) file from a *url* and return a Promise for a <a href="table">table</a>. Delimiters other than commas, such as tabs or pipes ('\|'), can be specified using the *options* argument. By default, automatic type inference is performed for input values; string values that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior set *options.autoType* to `false`, which will cause all columns to be loaded as strings. To perform custom parsing of input column values, use *options.parse*.

This method performs both loading and parsing, and is equivalent to `aq.load(url, { using: aq.fromCSV })`. To instead parse a CSV string that has already been loaded, use [fromCSV](#fromCSV).

When invoked in the browser, the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used to load the *url*. When invoked in node.js, the *url* argument can also be a local file path. If the input *url* string has a network protocol at the beginning (e.g., `'http://'`, `'https://'`, *etc*.) it is treated as a URL and the [node-fetch](https://github.com/node-fetch/node-fetch) library is used. If the `'file://'` protocol is used, the rest of the string should be an absolute file path, from which a local file is loaded. Otherwise the input is treated as a path to a local file and loaded using the node.js `fs` module.

* *url*: The url or local file (node.js only) to load.
* *options*: File loading and CSV formatting options. Accepts the options of both the [load](#load) and [fromCSV](#fromCSV) methods, but ignores any settings for the load *as* and *using* options.

*Examples*

```js
// load table from a CSV file
const dt = await aq.loadCSV('data/table.csv');
```

```js
// load table from a tab-delimited file
const dt = await aq.loadCSV('data/table.tsv', { delimiter: '\t' })
```


<hr/><a id="loadFixed" href="#loadFixed">#</a>
<em>aq</em>.<b>loadFixed</b>(<i>url</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/load-file.js)

Load a fixed-width file from a *url* and return a Promise for a <a href="table">table</a>. By default, automatic type inference is performed for input values; string values that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior set *options.autoType* to `false`, which will cause all columns to be loaded as strings. To perform custom parsing of input column values, use *options.parse*.

This method performs both loading and parsing, and is equivalent to `aq.load(url, { using: aq.fromFixed })`. To instead parse a fixed width string that has already been loaded, use [fromFixed](#fromFixed).

When invoked in the browser, the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used to load the *url*. When invoked in node.js, the *url* argument can also be a local file path. If the input *url* string has a network protocol at the beginning (e.g., `'http://'`, `'https://'`, *etc*.) it is treated as a URL and the [node-fetch](https://github.com/node-fetch/node-fetch) library is used. If the `'file://'` protocol is used, the rest of the string should be an absolute file path, from which a local file is loaded. Otherwise the input is treated as a path to a local file and loaded using the node.js `fs` module.

* *url*: The url or local file (node.js only) to load.
* *options*: File loading and fixed-width formatting options. Accepts the options of both the [load](#load) and [fromFixed](#fromFixed) methods, but ignores any settings for the load *as* and *using* options.

*Examples*

```js
// load table from a fixed-width file
const dt = await aq.loadFixed('a1\nb2', { widths: [1, 1], names: ['u', 'v'] });
```


<hr/><a id="loadJSON" href="#loadJSON">#</a>
<em>aq</em>.<b>loadJSON</b>(<i>url</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/load-file.js)

Load a JavaScript Object Notation (JSON) file from a *url* and return a Promise for a <a href="table">table</a>. If the loaded JSON is array-valued, an array-of-objects format is assumed and the [from](#from) method is used to construct the table. Otherwise, a column object format (as produced by [toJSON](table/#toJSON)) is assumed and the [fromJSON](#fromJSON) method is applied.

This method performs both loading and parsing, similar to `aq.load(url, { as: 'json', using: aq.fromJSON })`. To instead parse JSON data that has already been loaded, use either [from](#from) or [fromJSON](#fromJSON).

When parsing using [fromJSON](#fromJSON), string values in JSON column arrays that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior, set *options.autoType* to `false`. To perform custom parsing of input column values, use *options.parse*. Auto-type Date parsing is not performed for columns with custom parse options.

When invoked in the browser, the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) is used to load the *url*. When invoked in node.js, the *url* argument can also be a local file path. If the input *url* string has a network protocol at the beginning (e.g., `'http://'`, `'https://'`, *etc*.) it is treated as a URL and the [node-fetch](https://github.com/node-fetch/node-fetch) library is used. If the `'file://'` protocol is used, the rest of the string should be an absolute file path, from which a local file is loaded. Otherwise the input is treated as a path to a local file and loaded using the node.js `fs` module.

* *url*: The url or local file (node.js only) to load.
* *options*: File loading and JSON formatting options. Accepts the options of both the [load](#load) and [fromJSON](#fromJSON) methods, but ignores any settings for the load *as* and *using* options. Options for [fromJSON](#fromJSON) are ignored when [from](#from) is used for parsing.

*Examples*

```js
// load table from a JSON file
const dt = await aq.loadJSON('data/table.json');
```

```js
// load table from a JSON file, disable Date autoType
const dt = await aq.loadJSON('data/table.json', { autoType: false })
```


<br/>

## <a id="output">Table Output</a>

Methods for writing data to an output format. Most output methods are available as [table methods](table#output), in addition to the top level namespace.

<hr/><a id="toArrow" href="#toArrow">#</a>
<em>aq</em>.<b>toArrow</b>(<i>data</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/arrow/to-arrow.js)

Create an [Apache Arrow](https://arrow.apache.org/docs/js/) table for the input *data*. The input data can be either an [Arquero table](#table) or an array of standard JavaScript objects. This method will throw an error if type inference fails or if the generated columns have differing lengths. For Arquero tables, this method can instead be invoked as [table.toArrow()](table#toArrow).

* *data*: An input dataset to convert to Arrow format. If array-valued, the data should consist of an array of objects where each entry represents a row and named properties represent columns. Otherwise, the input data should be an [Arquero table](#table).
* *options*: Options for Arrow encoding.
  * *columns*: Ordered list of column names to include. If function-valued, the function should accept the input *data* as a single argument and return an array of column name strings.
  * *limit*: The maximum number of rows to include (default `Infinity`).
  * *offset*: The row offset indicating how many initial rows to skip (default `0`).
  * *types*: An optional object indicating the [Arrow data type](https://arrow.apache.org/docs/js/enums/Arrow_dom.Type.html) to use for named columns. If specified, the input should be an object with column names for keys and Arrow data types for values. If a column's data type is not explicitly provided, type inference will be performed.

    Type values can either be instantiated Arrow [DataType](https://arrow.apache.org/docs/js/classes/Arrow_dom.DataType.html) instances (for example, `new Float64()`,`new DateMilliseconds()`, *etc.*) or type enum codes (`Type.Float64`, `Type.Date`, `Type.Dictionary`). High-level types map to specific data type instances as follows:

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
import { table, toArrow } from 'arquero';
import { Type } from 'apache-arrow';

// create Arquero table
const dt = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
});

// encode as an Arrow table (infer data types)
// here, infers Uint8 for 'x' and Float64 for 'y'
// equivalent to dt.toArrow()
const at1 = toArrow(dt);

// encode into Arrow table (set explicit data types)
// equivalent to dt.toArrow({ types: { ... } })
const at2 = toArrow(dt, {
  types: {
    x: Type.Uint16,
    y: Type.Float32
  }
});

// serialize Arrow table to a transferable byte array
const bytes = at1.serialize();
```

Encode Arrow data from an input object array:

```js
import { toArrow } from 'arquero';

// encode object array as an Arrow table (infer data types)
const at = toArrow([
  { x: 1, y: 3.4 },
  { x: 2, y: 1.6 },
  { x: 3, y: 5.4 },
  { x: 4, y: 7.1 },
  { x: 5, y: 2.9 }
]);
```

<hr/><a id="toArrowIPC" href="#toArrowIPC">#</a>
<em>table</em>.<b>toArrowBuffer</b>(<i>data</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/arrow/to-arrow-ipc.js)

Format input data in the binary [Apache Arrow](https://arrow.apache.org/docs/js/) IPC format. The input data can be either an [Arquero table](#table) or an array of standard JavaScript objects. This method will throw an error if type inference fails or if the generated columns have differing lengths. For Arquero tables, this method can instead be invoked as [table.toArrowIPC()](table#toArrowIPC).

The resulting binary data may be saved to disk or passed between processes or tools. For example, when using [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), the output of this method can be passed directly between threads (no data copy) as a [Transferable](https://developer.mozilla.org/en-US/docs/Web/API/Transferable) object. Additionally, Arrow binary data can be loaded in other language environments such as [Python](https://arrow.apache.org/docs/python/) or [R](https://arrow.apache.org/docs/r/).

This method will throw an error if type inference fails or if the generated columns have differing lengths.

* *options*: Options for Arrow encoding, same as [toArrow](#toArrow) but with an additional *format* option.
  * *format*: The Arrow IPC byte format to use. One of `'stream'` (default) or `'file'`.

*Examples*

Encode Arrow data from an input Arquero table:

```js
import { table, toArrowIPC } from 'arquero';

const dt = table({
  x: [1, 2, 3, 4, 5],
  y: [3.4, 1.6, 5.4, 7.1, 2.9]
});

// encode table as a transferable Arrow byte buffer
// here, infers Uint8 for 'x' and Float64 for 'y'
const bytes = toArrowIPC(dt);
```

<br/>

## <a id="expression-helpers">Expression Helpers</a>

Methods for invoking or modifying table expressions.

<hr/><a id="op" href="#op">#</a>
<em>aq</em>.<b>op</b> · [Source](https://github.com/uwdata/arquero/blob/master/src/op/op-api.js)

All table expression operations, including standard functions, aggregate functions, and window functions. See the [Operations API Reference](op) for documentation of all available functions.

<hr/><a id="agg" href="#agg">#</a>
<em>aq</em>.<b>agg</b>(<i>table</i>, <i>expression</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/helpers/agg.js)

Compute a single aggregate value for a table. This method is a convenient shortcut for ungrouping a table, applying a [rollup](verbs#rollup) verb for a single aggregate expression, and extracting the resulting aggregate value.

* *table*: An Arquero table.
* *expression*: An aggregate-valued table expression. Aggregate functions are permitted, and will take into account any [orderby](#orderby) settings. Window functions are not permitted and any [groupby](#groupby) settings will be ignored.

*Examples*

```js
aq.agg(aq.table({ a: [1, 2, 3] }), op.max('a')) // 3
```

```js
aq.agg(aq.table({ a: [1, 3, 5] }), d => [op.min(d.a), op.max('a')]) // [1, 5]
```


<hr/><a id="escape" href="#escape">#</a>
<em>aq</em>.<b>escape</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/escape.js)

Annotate a JavaScript function or *value* to bypass Arquero's default table expression handling. Escaped values enable the direct use of JavaScript functions to process row data: no internal parsing or code generation is performed, and so [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) and arbitrary function invocations are supported. Escaped values provide a lightweight alternative to [table params](table#params) and [function registration](extensibility#addFunction) to access variables in enclosing scopes.

An escaped value can be applied anywhere Arquero accepts [single-table table expressions](expressions#table), including the [derive](verbs#derive), [filter](verbs#filter), and [spread](verbs#spread) verbs. In addition, any of the [standard `op` functions](op#functions) can be used within an escaped function. However, aggregate and window `op` functions are not supported. Also note that using escaped values will break [serialization of Arquero queries to worker threads](https://github.com/uwdata/arquero-worker).

* *value*: A literal value or a function that is passed a row object and params object as input. Aggregate and window `op` functions are not permitted.

*Examples*

```js
// filter based on a variable defined in the enclosing scope
const thresh = 5;
aq.table({ a: [1, 4, 9], b: [1, 2, 3] })
  .filter(aq.escape(d => d.a < thresh))
  // { a: [1, 4], b: [1, 2] }
```

```js
// apply a parsing function defined in the enclosing scope
const parseMDY = d3.timeParse('%m/%d/%Y');
aq.table({ date: ['1/1/2000', '06/01/2010', '12/10/2020'] })
  .derive({ date: aq.escape(d => parseMDY(d.date)) })
  // { date: [new Date(2000,0,1), new Date(2010,5,1), new Date(2020,11,10)] }
```

```js
// spread results from an escaped function that returns an array
const denom = 4;
aq.table({ a: [1, 4, 9] })
  .spread(
    { a: aq.escape(d => [Math.floor(d.a / denom), d.a % denom]) },
    { as: ['div', 'mod'] }
  )
  // { div: [0, 1, 2], mod: [1, 0, 1] }
```


<hr/><a id="bin" href="#bin">#</a>
<em>aq</em>.<b>bin</b>(<i>name</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/bin.js)

Generate a table expression that performs uniform binning of number values. The resulting string can be used as part of the input to table transformation verbs.

* *name*: The name of the column to bin.
* *options*: A binning scheme options object:
  * *maxbins*: The maximum number of bins.
  * *minstep*: The minimum step size between bins.
  * *nice*: Boolean flag (default `true`) indicating if bins should snap to "nice" human-friendly values such as multiples of ten.
  * *offset*: Step offset for bin boundaries. The default (`0`) floors to the lower bin boundary. A value of `1` snaps one step higher to the upper bin boundary, and so on.
  * *step*: The exact step size to use between bins. If specified, the *maxbins* and *minstep* options are ignored.

 *Examples*

```js
 aq.bin('colA', { maxbins: 20 })
 ```


<hr/><a id="desc" href="#desc">#</a>
<em>aq</em>.<b>desc</b>(<i>expr</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/desc.js)

Annotate a table expression (*expr*) to indicate descending sort order.

* *expr*: The table expression to annotate.

*Examples*

```js
// sort colA in descending order
aq.desc('colA')
```

```js
// sort colA in descending order of lower case values
aq.desc(d => op.lower(d.colA))
```

<hr/><a id="frac" href="#frac">#</a>
<em>aq</em>.<b>frac</b>(<i>fraction</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/frac.js)

Generate a table expression that computes the number of rows corresponding to a given fraction for each group. The resulting string can be used as part of the input to the [sample](verbs#sample) verb.

* *fraction*: The fractional value.

 *Examples*

```js
 aq.frac(0.5)
 ```

<hr/><a id="rolling" href="#rolling">#</a>
<em>aq</em>.<b>rolling</b>(<i>expr</i>[, <i>frame</i>, <i>includePeers</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/rolling.js)

Annotate a table expression to compute rolling aggregate or window functions within a sliding window frame. For example, to specify a rolling 7-day average centered on the current day, call *rolling* with a frame value of [-3, 3].

* *expr*: The table expression to annotate.
* *frame*:The sliding window frame offsets. Each entry indicates an offset from the current value. If an entry is non-finite, the frame will be unbounded in that direction, including all preceding or following values. If unspecified or `null`, the default frame `[-Infinity, 0]` includes the current values and all preceding values.
* *includePeers*: Boolean flag indicating if the sliding window frame should ignore peer (tied) values. If `false` (the default), the window frame boundaries are insensitive to peer values. If `true`, the window frame expands to include all peers. This parameter only affects operations that depend on the window frame: namely [aggregate functions](op#aggregate-functions) and the [first_value](op#first_value), [last_value](op#last_value), and [nth_value](op#last_values) window functions.

*Examples*

```js
// cumulative sum, with an implicit frame of [-Infinity, 0]
aq.rolling(d => op.sum(d.colA))
```

```js
// centered 7-day moving average, assuming one value per day
aq.rolling(d => op.mean(d.colA), [-3, 3])
```

```js
// retrieve last value in window frame, including peers (ties)
aq.rolling(d => op.last_value(d.colA), [-3, 3], true)
```

<hr/><a id="seed" href="#seed">#</a>
<em>aq</em>.<b>seed</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/util/random.js)

Set a seed value for random number generation. If the seed is a valid number, a 32-bit [linear congruential generator](https://en.wikipedia.org/wiki/Linear_congruential_generator) with the given seed will be used to generate random values. If the seed is `null`, `undefined`, or not a valid number, the random number generator will revert to `Math.random`.

* *seed*: The random seed value. Should either be an integer or a fraction between 0 and 1.

*Examples*

```js
// set random seed as an integer
aq.seed(12345)
```

```js
// set random seed as a fraction, maps to floor(fraction * (2 ** 32))
aq.seed(0.5)
```

```js
// revert to using Math.random
aq.seed(null)
```

<br/>

## <a id="selection-helpers">Selection Helpers</a>

Methods for selecting columns. The result of these methods can be passed as arguments to [select](verbs#select), [groupby](verbs#groupby), [join](verbs#join) and other transformation verbs.

<hr/><a id="all" href="#all">#</a>
<em>aq</em>.<b>all</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns in a table. Returns a function-valued selection compatible with [select](verbs#select).

*Examples*

```js
aq.all()
```


<hr/><a id="not" href="#not">#</a>
<em>aq</em>.<b>not</b>(<i>selection</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Negate a column *selection*, selecting all other columns in a table. Returns a function-valued selection compatible with [select](verbs#select).

* *selection*: The selection to negate. May be a column name, column index, array of either, or a selection function (e.g., from [range](#range)).

*Examples*

```js
aq.not('colA', 'colB')
```

```js
aq.not(aq.range(2, 5))
```


<hr/><a id="range" href="#range">#</a>
<em>aq</em>.<b>range</b>(<i>start</i>, <i>stop</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select a contiguous range of columns. Returns a function-valued selection compatible with [select](verbs#select).

* *start*: The name or integer index of the first selected column.
* *stop*: The name or integer index of the last selected column.

*Examples*

```js
aq.range('colB', 'colE')
```

```js
aq.range(2, 5)
```

<hr/><a id="matches" href="#matches">#</a>
<em>aq</em>.<b>matches</b>(<i>pattern</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns whose names match a pattern. Returns a function-valued selection compatible with [select](verbs#select).

* *pattern*: A string or [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) pattern to match.

*Examples*

```js
// contains the string 'col'
aq.matches('col')
```

```js
// has 'a', 'b', or 'c' as the first character (case-insensitve)
aq.matches(/^[abc]/i)
```

<hr/><a id="startswith" href="#startswith">#</a>
<em>aq</em>.<b>startswith</b>(<i>string</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns whose names start with a string. Returns a function-valued selection compatible with [select](verbs#select).

* *string*: The string to match at the start of the column name.

*Examples*

```js
aq.startswith('prefix_')
```

<hr/><a id="endswith" href="#endswith">#</a>
<em>aq</em>.<b>endswith</b>(<i>string</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns whose names end with a string. Returns a function-valued selection compatible with [select](verbs#select).

* *string*: The string to match at the end of the column name.

*Examples*

```js
aq.endswith('_suffix')
```

<hr/><a id="names" href="#names">#</a>
<em>aq</em>.<b>names</b>(<i>...names</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/names.js)

Select columns by index and rename them to the provided *names*. Returns a selection helper function that takes a table as input and produces a rename map as output. If the number of provided names is less than the number of table columns, the rename map will include entries for the provided names only. If the number of table columns is less than then number of provided names, the rename map will include only entries that cover the existing columns.

* *names*: An ordered set of strings to use as the new column names.

*Examples*

```js
// helper to rename the first three columns to 'a', 'b', 'c'
aq.names('a', 'b', 'c')
```

```js
// names can also be passed as arrays
aq.names(['a', 'b', 'c'])
```

```js
// rename the first three columns, all other columns remain as-is
table.rename(aq.names(['a', 'b', 'c']))
```

```js
// select and rename the first three columns, all other columns are dropped
table.select(aq.names(['a', 'b', 'c']))
```

---
title: Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[**Top-Level**](/arquero/api) | [Table](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions)

* [Table Constructors](#table-constructors)
  * [table](#table), [from](#from), [fromArrow](#fromArrow), [fromCSV](#fromCSV), [fromJSON](#fromJSON)
* [Expression Helpers](#expression-helpers)
  * [op](#op), [bin](#bin), [desc](#desc), [frac](#frac), [rolling](#rolling), [seed](#seed)
* [Selection Helpers](#selection-helpers)
  * [all](#all), [not](#not), [range](#range)
  * [matches](#matches), [startswith](#startswith), [endswith](#endswith)
* [Extensibility](#extensibility)
  * [addFunction](#addFunction), [addAggregateFunction](#addAggregateFunction), [addWindowFunction](#addWindowFunction)
* [Queries](#queries)
  * [query](#query), [queryFrom](#queryFrom)


<br/>

## <a id="table-constructors">Table Constructors</a>

Methods for creating new table instances.

<hr/><a id="table" href="#table">#</a>
<em>aq</em>.<b>table</b>(<i>columns</i>[, <i>names</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/table/index.js)

Create a new <a href="table">table</a> for a set of named *columns*, optionally including an array of ordered column *names*. The *columns* input can be an object or Map with names for keys and columns for values, or an entry array of `[name, values]` tuples.

JavaScript objects have specific key ordering rules: keys are enumerated in the order they are assigned, except for integer keys, which are enumerated first in sorted order. As a result, when using a standard object any *columns* entries with integer keys are listed first regardless of their order in the object definition. Use the *names* argument to ensure proper column ordering is respected. Map and entry arrays will preserve name ordering, in which case the *names* argument is only needed if you wish to specify an ordering different from the *columns* input.

To bind together columns from multiple tables with the same number of rows, use the table [assign](table/#assign) method. To transform the table, use the various [verb](verbs) methods.

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

Create a new <a href="table">table</a> backed by an [Apache Arrow](https://arrow.apache.org/docs/js/) table instance. Both standard and filtered tables are supported. If the input Arrow table is filtered, new column arrays are created and filled with unpacked, non-filtered values.

For primitive data types, by default Arquero uses the binary-encoded Arrow columns as-is with zero data copying. Nested list or struct types are always unpacked into JavaScript array or object instances, respectively.

The *unpack* option determines if Arrow data should be "unpacked" from binary format to standard JavaScript values. By default, Arrow columns for non-nested data types are used directly. This avoids data copies, but can result in slower access paths, particularly for dictionary columns and strings that need to be extracted from a backing buffer. With *unpack* set to `true`, Arquero performs extraction up front, increasing initialization time and memory use, but enabling faster performance for subsequent queries.

* *arrowTable*: An [Apache Arrow](https://arrow.apache.org/docs/js/) data table.
* *options*: An Arrow import options object:
  * *columns*: An ordered set of columns to import. The input may consist of: column name strings, column integer indices, objects with current column names as keys and new column names as values (for renaming), or a selection helper function such as [all](#all), [not](#not), or [range](#range)).
  * *unpack*: A boolean flag (default `false`) to unpack binary-encoded Arrow data to standard JavaScript values. Unpacking can incur an upfront time and memory cost to extract data to new arrays, but can speed up later query processing by enabling faster data access.

*Examples*

```js
// requires that Apache Arrow has been imported as the 'arrow' variable
// load an Arrow file from 'url' and create a corresponding Arquero table
const arrow = require('apache-arrow');
aq.fromArrow(await arrow.Table.from(fetch(url)))
```


<hr/><a id="fromCSV" href="#fromCSV">#</a>
<em>aq</em>.<b>fromCSV</b>(<i>text</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-csv.js)

Parse a comma-separated values (CSV) *text* string into a <a href="table">table</a>. Delimiters other than commas, such as tabs or pipes ('\|'), can be specified using the *options* argument. By default, automatic type inference is performed for input values; string values that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior set *options.autoType* to `false`, which will cause all columns to be loaded as strings. To perform custom parsing of input column values, use *options.parse*.

* *text*: A string in a delimited-value format.
* *options*: A CSV format options object:
  * *delimiter*: A single-character delimiter string between column values.
  * *header*: Boolean flag (default `true`) to specify the presence of a  header row. If `true`, indicates the CSV contains a header row with column names. If `false`, indicates the CSV does not contain a header row and the columns are given the names `'col1'`, `'col2'`, and so on.
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
// override autoType with custom parser for column 'a'
// akin to table({ a: ['00152', '30219'], b: [2, 4] })
aq.fromCSV('a,b\n00152,2\n30219,4', { parse: { a: String } })
```

```js
// create table from an input CSV loaded from 'url'
aq.fromCSV(await fetch(url).text())
```


<hr/><a id="fromJSON" href="#fromJSON">#</a>
<em>aq</em>.<b>fromJSON</b>(<i>data</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-json.js)

Parse JavaScript Object Notation (JSON) *data* into a <a href="table">table</a>. If the input *data* is string-valued, string values in JSON text that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior, set *options.autoType* to `false`. To perform custom parsing of input column values (regardless of *data* input type), use *options.parse*.

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
aq.fromJSON(await fetch(url).text())
```

```js
// create table from an input JSON object loaded from 'url'
// passing pre-parsed JSON bypasses autoType Date parsing
aq.fromJSON(await fetch(url).json())
```


<br/>

## <a id="expression-helpers">Expression Helpers</a>

Methods for invoking or modifying table expressions.

<hr/><a id="op" href="#op">#</a>
<em>aq</em>.<b>op</b> · [Source](https://github.com/uwdata/arquero/blob/master/src/op/op-api.js)

All table expression operations, including standard functions, aggregate functions, and window functions. See the [Operations API Reference](op) for documentation of all available functions.

<hr/><a id="bin" href="#bin">#</a>
<em>aq</em>.<b>bin</b>(<i>name</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/bin.js)

Generate a table expression that performs uniform binning of number values. The resulting string can be used as part of the input to table transformation verbs.

* *name*: The name of the column to bin.
* *options*: A binning scheme options object:
  * *maxbins*: The maximum number of bins.
  * *minstep*: The minimum step size between bins.
  * *nice*: Boolean flag (default `true`) indicating if bins should snap to "nice" human-friendly values such as multiples of ten.
  * *offset*: Step offset for bin boundaries. The default (`0`) floors to the lower bin boundary. A value of `1` snaps one step higher to the upper bin boundary, and so on.

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

Generate a table expression that computes the number of rows corresponding to a given fraction for each group. The resulting string can be used as part of the input to the [sample](verbs/#sample) verb.

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
* *includePeers*: Boolean flag indicating if the sliding window frame should ignore peer (tied) values. If `false` (the default), the window frame boundaries are insensitive to peer values. If `true`, the window frame expands to include all peers. This parameter only affects operations that depend on the window frame: namely [aggregate functions](op/#aggregate-functions) and the [first_value](op/#first_value), [last_value](op/#last_value), and [nth_value](op/#last_values) window functions.

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

Methods for selecting columns. The result of these methods can be passed as arguments to [select](verbs/#select), [groupby](verbs/#groupby), [join](verbs/#join) and other transformation verbs.

<hr/><a id="all" href="#all">#</a>
<em>aq</em>.<b>all</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns in a table. Returns a function-valued selection compatible with [select](verbs/#select).

*Examples*

```js
aq.all()
```


<hr/><a id="not" href="#not">#</a>
<em>aq</em>.<b>not</b>(<i>selection</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Negate a column *selection*, selecting all other columns in a table. Returns a function-valued selection compatible with [select](verbs/#select).

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

Select a contiguous range of columns. Returns a function-valued selection compatible with [select](verbs/#select).

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
<em>aq</em>.<b>matches</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns whose names match a pattern. Returns a function-valued selection compatible with [select](verbs/#select).

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
<em>aq</em>.<b>startswith</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns whose names start with a string. Returns a function-valued selection compatible with [select](verbs/#select).

* *string*: The string to match at the start of the column name.

*Examples*

```js
aq.startswith('prefix_')
```

<hr/><a id="endswith" href="#endswith">#</a>
<em>aq</em>.<b>endswith</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/helpers/selection.js)

Select all columns whose names end with a string. Returns a function-valued selection compatible with [select](verbs/#select).

* *string*: The string to match at the end of the column name.

*Examples*

```js
aq.endswith('_suffix')
```

<br/>

## <a id="extensibility">Extensibility</a>

Methods for adding new functions for use in table expressions.

<hr/><a id="addFunction" href="#addFunction">#</a>
<em>aq</em>.<b>addFunction</b>([<i>name</i>,] <i>fn</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/register.js)

Register a function for use within table expressions. If only a single argument is provided, it will be assumed to be a function and the system will try to extract its name. Throws an error if a function with the same name is already registered and the override option is not specified, or if no name is provided and the input function is anonymous. After registration, the function will be accessible via the [`op`](#op) object.

* *name*: The name to use for the function.
* *fn*: A standard JavaScript function.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added function is allowed to override an existing function with the same name.

*Examples*

```js
// add a function named square, which is then available as op.square()
// if a 'square' function already exists, this results in an error
aq.addFunction('square', x => x * x);
```

```js
// add a function named square, override any previous 'square' definition
aq.addFunction('square', x => x * x, { override: true });
```

```js
// add a function using its existing name
aq.addFunction(function square(x) { return x * x; });
```


<hr/><a id="addAggregateFunction" href="#addAggregateFunction">#</a>
<em>aq</em>.<b>addAggregateFunction</b>(<i>name</i>, <i>def</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/register.js)

Register a custom aggregate function. Throws an error if a function with the same name is already registered and the override option is not specified. After registration, the operator will be accessible via the [`op`](#op) object.

* *name*: The name to use for the aggregate function.
* *def*: An aggregate operator definition object:
  * *create*: A creation function that takes non-field parameter values as input and returns a new aggregate operator instance. An aggregate operator instance should have four methods: *init(state)* to initialize any operator state, *add(state, value)* to add a value to the aggregate, *rem(state, value)* to remove a value from the aggregate, and *value(state)* to retrieve the current operator output value. The *state* parameter is a normal object for tracking all state information for a shared set of input field values.
  * *param*: Two-element array containing the counts of input fields and additional parameters, respectively. If the *numFields* and *numParams* options are provided they override this property.
  * *req*: Names of aggregate operators required by this one.
  * *stream*: Names of operators required by this one for streaming operations (value removes), used during windowed aggregations.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added function is allowed to override an existing function with the same name.
  * *numFields*: The number of field (column) inputs to the operator (default `0`).
  * *numParams*: The number of additional operator parameters (default `0`).


<hr/><a id="addWindowFunction" href="#addWindowFunction">#</a>
<em>aq</em>.<b>addWindowFunction</b>(<i>name</i>, <i>def</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/register.js)

Register a custom window function. Throws an error if a function with the same name is already registered and the override option is not specified. After registration, the operator will be accessible via the [`op`](#op) object.

* *name*: The name to use for the window function.
* *def*: A window operator definition object:
  * *create*: A creation function that takes non-field parameter values as input and returns a new window operator instance. A window operator instance should have two methods: *init(state)* to initialize any operator state, and *value(state)* to retrieve the current operator output value. The *state* parameter is a [window state](https://github.com/uwdata/arquero/blob/master/src/engine/window/window-state.js) instance that provides access to underlying values and the sliding window frame.
  * *param*: Two-element array containing the counts of input fields and additional parameters, respectively. If the *numFields* and *numParams* options are provided they override this property.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added function is allowed to override an existing function with the same name.
  * *numFields*: The number of field (column) inputs to the operator (default `0`).
  * *numParams*: The number of additional operator parameters (default `0`).


<br/>

## <a id="queries">Queries</a>

Queries allow deferred processing. Rather than process a sequence of verbs immediately, they can be stored as a query. The query can then be *serialized* to be stored or transferred, or later *evaluated* against an Arquero table.

<hr/><a id="query" href="#query">#</a>
<em>aq</em>.<b>query</b>([<i>tableName</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/query/query.js)

Create a new query builder instance. The optional *tableName* string argument indicates the default name of a table the query should process, and is used only when evaluating a query against a catalog of tables. The resulting query builder includes the same [verb](verbs) methods as a normal Arquero table. However, rather than evaluating verbs immediately, they are stored as a list of verbs to be evaluated later.

The method *query.evaluate(table, catalog)* will evaluate the query against an Arquero table. If provided, the optional *catalog* argument should be a function that takes a table name string as input and returns a corresponding Arquero table instance. The catalog will be used to lookup tables referenced by name for multi-table operations such as joins, or to lookup the primary table to process when the *table* argument to evaluate is `null` or `undefined`.

Use the query *toObject()* method to serialize a query to a JSON-compatible object. Use the top-level [queryFrom](#queryFrom) method to parse a serialized query and return a new "live" query instance.

*Examples*

```js
// create a query, then evaluate it on an input table
const q = aq.query()
  .derive({ add1: d => d.value + 1 })
  .filter(d => d.add1 > 5 );

const t = q.evaluate(table);
```

```js
// serialize a query to a JSON-compatible object
// the query can be reconstructed using aq.queryFrom
aq.query()
  .derive({ add1: d => d.value + 1 })
  .filter(d => d.add1 > 5 )
  .toObject();
```


<hr/><a id="queryFrom" href="#queryFrom">#</a>
<em>aq</em>.<b>queryFrom</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/query/query.js)

Parse a serialized query *object* and return a new query instance. The input *object* should be a serialized query representation, such as those generated by the query *toObject()* method.

*Examples*

```js
// round-trip a query to a serialized form and back again
aq.queryFrom(
  aq.query()
    .derive({ add1: d => d.value + 1 })
    .filter(d => d.add1 > 5 )
    .toObject()
)
```
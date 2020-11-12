---
title: Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[**Top-Level**](/arquero/api) | [Table](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions)

* [Table Constructors](#table-constructors)
  * [table](#table), [from](#from), [fromArrow](#fromArrow), [fromCSV](#fromCSV), [fromJSON](#fromJSON)
* [Expression Helpers](#expression-helpers)
  * [op](#op), [bin](#bin), [desc](#desc), [rolling](#rolling), [seed](#seed)
* [Selection Helpers](#selection-helpers)
  * [all](#all), [not](#not), [range](#range)
* [Extensibility](#extensibility)
  * [addFunction](#addFunction), [addAggregateFunction](#addAggregateFunction), [addWindowFunction](#addAggregateFunction)
* [Queries](#queries)
  * [query](#query), [queryFrom](#queryFrom)


<br/>

## <a id="table-constructors">Table Constructors</a>

Methods for creating new table instances.

<hr/><a id="table" href="#table">#</a>
<em>aq</em>.<b>table</b>(<i>columns</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Create a new <a href="table">table</a> for a set of named *columns*.

* *columns*: An object providing a named set of column arrays. Object keys are column names; the enumeration order of the keys determines the column indices. Object values must be arrays (or array-like values) of identical length.

*Examples*

```js
aq.table({ colA: ['a', 'b', 'c'], colB: [3, 4, 5] })
```


<hr/><a id="from" href="#from">#</a>
<em>aq</em>.<b>from</b>(<i>values</i>[, <i>names</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Create a new <a href="table">table</a> from an existing object, such as an array of objects or a set of key-value pairs.

* *values*: Data values to populate the table. If array-valued or iterable, imports rows for each non-null value, using the provided column names as keys for each row object. If no *names* are provided, the first non-null object's own keys are used. If an object or a Map, create a two-column table with columns for the input keys and values.
* *names*: Column names to include. For object or Map inputs, specifies the key and value column names. Otherwise, specifies the keys to look up on each row object.

*Examples*

```js
aq.from([ { colA: 1, colB: 2 }, { colA: 3, colB: 4 } ])
```

```js
aq.from({ a: 1, b: 2, c: 3})
```

```js
aq.from(new Map([ ['d', 4], ['e', 5], ['f', 6] ])
```


<hr/><a id="fromArrow" href="#fromArrow">#</a>
<em>aq</em>.<b>fromArrow</b>(<i>arrowTable</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-arrow.js)

Create a new <a href="table">table</a> backed by an [Apache Arrow](https://arrow.apache.org/) table instance.

 * *arrowTable*: An Apache Arrow data table.
 * *options*: An Arrow import options object:
   * *columns*: Ordered list of column names to include.
   * *unpack*: A boolean flag (default `false`) to unpack binary-encoded Arrow data to standard JavaScript values. Unpacking can incur an upfront time and memory cost to extract data to new arrays, but can speed up later query processing by enabling faster data access.


<hr/><a id="fromCSV" href="#fromCSV">#</a>
<em>aq</em>.<b>fromCSV</b>(<i>text</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-csv.js)

Parse a comma-separated values (CSV) *text* string into a <a href="table">table</a>. Delimiters other than commas, such as tabs or pipes ('\|'), can be specified using the *options* argument.By default, automatic type inference is performed for input values; string values that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior, set *options.autoType* to `false`. To perform custom parsing of input column values, use *options.parse*.

 * *text*: A string in a delimited-value format.
 * *options*: A CSV format options object:
   * *delimiter*: The delimiter string between column values.
   * *header*: Boolean flag (default `true`) to specify the presence of a  header row. If `true`, indicates the CSV contains a header row with column names. If `false`, indicates the CSV does not contain a header row and the columns are given the names `'col1'`, `'col2'`, and so on.
   * *autoType*: Boolean flag (default `true`) for automatic type inference.
   * *parse*: Object of column parsing options. The object keys should be column names. The object values should be parsing functions to invoke to transform values upon input.


<hr/><a id="fromJSON" href="#fromJSON">#</a>
<em>aq</em>.<b>fromJSON</b>(<i>data</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/format/from-json.js)

Parse JavaScript Object Notation (JSON) *data* into a <a href="table">table</a>. The expected JSON format is an object with column names for keys and column value arrays for values. If the input *data* is string-valued, parsed string values in JSON text that match the ISO standard date format are parsed into JavaScript Date objects. To disable this behavior, set *options.autoType* to `false`. To perform custom parsing of input column values (regardless of *data* input type), use *options.parse*.

* *data*: A string in a JSON format, or a corresponding Object instance.
* *options*: A JSON format options object:
  * *autoType*: Boolean flag (default `true`) for automatic type inference. If `false`, automatic date parsing for input JSON strings is disabled.
  * *parse*: Object of column parsing options. The object keys should be column names. The object values should be parsing functions to invoke to transform values upon input.


<br/>

## <a id="expression-helpers">Expression Helpers</a>

Methods for invoking or modifying table expressions.

<hr/><a id="op" href="#op">#</a>
<em>aq</em>.<b>op</b> · [Source](https://github.com/uwdata/arquero/blob/master/src/op/op-api.js)

All table expression operations, including standard functions, aggregate functions, and window functions. See the [Operations API Reference](op) for documentation of all available functions.

<hr/><a id="bin" href="#bin">#</a>
<em>aq</em>.<b>bin</b>(<i>name</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/expr/bin.js)

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
<em>aq</em>.<b>desc</b>(<i>expr</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/expr/desc.js)

Annotate a table expression (*expr*) to indicate descending sort order.

* *expr*: The table expression to annotate.

*Examples*

```js
aq.desc('colA') // sort colA in descending order
```

```js
aq.desc(d => op.lower(d.colA)) // descending order of lower case values
```

<a id="rolling" href="#rolling">#</a>
<em>aq</em>.<b>rolling</b>(<i>expr</i>[, <i>frame</i>, <i>includePeers</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/expr/rolling.js)

Annotate a table expression to compute rolling aggregate or window functions within a sliding window frame. For example, to specify a rolling 7-day average centered on the current day, call *rolling* with a frame value of [-3, 3].

* *expr*: The table expression to annotate.
* *frame*:The sliding window frame offsets. Each entry indicates an offset from the current value. If an entry is non-finite, the frame will be unbounded in that direction, including all preceding or following values. If unspecified or `null`, the default frame `[-Infinity, 0]` includes the current values and all preceding values.
* *includePeers*: Boolean flag indicating if the sliding window frame should ignore peer (tied) values. If `false` (the default), the window frame boundaries are insensitive to peer values. If `true`, the window frame expands to include all peers. This parameter only affects operations that depend on the window frame: namely [aggregate functions](op/#aggregate-functions) and the [first_value](op/#first_value), [last_value](op/#last_value), and [nth_value](op/#last_values) window functions.

*Examples*

```js
aq.rolling(d => op.sum(d.colA)) // cumulative sum
```

```js
aq.rolling(d => op.mean(d.colA), [-3, 3]) // centered 7-day moving average, assuming one value per day
```

```js
aq.rolling(d => op.last_value(d.colA), [-3, 3], true) // last value in frame, including peers (ties)
```

<hr/><a id="seed" href="#seed">#</a>
<em>aq</em>.<b>seed</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/util/random.js)

Set a seed value for random number generation. If the seed is a valid number, a 32-bit [linear congruential generator](https://en.wikipedia.org/wiki/Linear_congruential_generator) with the given seed will be used to generate random values. If the seed is `null`, `undefined`, or not a valid number, the random number generator will revert to `Math.random`.

* *seed*: The random seed value. Should either be an integer or a fraction between 0 and 1.


<br/>

## <a id="selection-helpers">Selection Helpers</a>

Methods for selecting columns. The result of these methods can be passed as arguments to [select](verbs/#select), [groupby](verbs/#groupby), [join](verbs/#join) and other transformation verbs.

<hr/><a id="all" href="#all">#</a>
<em>aq</em>.<b>all</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/expr/selection.js)

Select all columns in a table. Returns a function-valued selection compatible with [select](verbs/#select).

*Examples*

```js
aq.all()
```


<hr/><a id="not" href="#not">#</a>
<em>aq</em>.<b>not</b>(<i>selection</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/expr/selection.js)

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
<em>aq</em>.<b>range</b>(<i>start</i>, <i>stop</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/expr/selection.js)

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
aq.addFunction('square', x => x * x);
```

```js
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
<em>aq</em>.<b>query</b>([<i>tableName</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/query/query-builder.js)

Create a new query builder instance. The optional *tableName* string argument indicates the default name of a table the query should process, and is used only when evaluating a query against a catalog of tables. The resulting query builder includes the same [verb](verbs) methods as a normal Arquero table. However, rather than evaluating verbs immediately, they are stored as a list of verbs to be evaluated later.

The method *query.evaluate(table, catalog)* will evaluate the query against an Arquero table. If provided, the optional *catalog* argument should be a function that takes a table name string as input and returns a corresponding Arquero table instance. The catalog will be used to lookup tables referenced by name for multi-table operations such as joins, or to lookup the primary table to process when the *table* argument to evaluate is `null` or `undefined`.

Use the query *toObject()* method to serialize a query to a JSON-compatible object. Use the top-level [queryFrom](#queryFrom) method to parse a serialized query and return a new "live" query instance.

*Examples*

```js
const q = aq.query()
  .derive({ add1: d => d.value + 1 })
  .filter(d => d.add1 > 5 );

const t = aq.evaluate(table);
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
<em>aq</em>.<b>queryFrom</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/query/query-builder.js)

Parse a serialized query *object* and return a new query instance. The input *object* should be a serialized query representation, such as those generated by the query *toObject()* method.

*Examples*

```js
// round-trips a query to a serialized form and back again
aq.queryFrom(
  aq.query()
    .derive({ add1: d => d.value + 1 })
    .filter(d => d.add1 > 5 )
    .toObject()
)
```
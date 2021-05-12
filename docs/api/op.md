---
title: Operations \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [Table](table) | [Verbs](verbs) | [**Op Functions**](op) | [Expressions](expressions) | [Extensibility](extensibility)

* [Standard Functions](#functions)
  * [Array Functions](#array-functions)
  * [Date Functions](#date-functions)
  * [JSON Functions](#json-functions)
  * [Math Functions](#math-functions)
  * [Object Functions](#object-functions)
  * [String Functions](#string-functions)
* [Aggregate Functions](#aggregate-functions)
  * [any](#any), [bins](#bins)
  * [count](#count), [distinct](#distinct), [valid](#valid), [invalid](#invalid)
  * [max](#max), [min](#min),  [sum](#sum), [product](#product)
  * [mean](#mean), [average](#average), [mode](#mode), [median](#median), [quantile](#quantile)
  * [stdev](#stdev), [stdevp](#stdevp), [variance](#variance), [variancep](#variance)
  * [corr](#corr), [covariance](#covariance), [covariancep](#covariancep)
  * [array_agg](#array_agg), [array_agg_distinct](#array_agg_distinct), [object_agg](#object_agg), [map_agg](#map_agg), [entries_agg](#entries_agg)
* [Window Functions](#window-functions)
  * [row_number](#row_number), [rank](#rank), [avg_rank](#avg_rank), [dense_rank](#dense_rank)
  * [percent_rank](#percent_rank), [cume_dist](#cume_dist), [ntile](#ntile)
  * [lag](#lag), [lead](#lead), [first_value](#first_value), [last_value](#last_value), [nth_value](#nth_value)
  * [fill_down](#fill_down), [fill_up](#fill_up)

<br/>

## <a id="functions">Standard Functions</a>

Standard library of table expression functions. The [`op` object](./#op) exports these as standard JavaScript functions that behave the same whether invoked inside or outside a table expression context.

### <a id="array-functions">Array Functions</a>

<hr/><a id="compact" href="#compact">#</a>
<em>op</em>.<b>compact</b>(<i>array</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns a new compacted array with invalid values (`null`, `undefined`, `NaN`) removed.

* *array*: The array to compact.

*Examples*

```js
op.compact([1, null, 2, undefined, NaN, 3]) // [ 1, 2, 3 ]
```

<hr/><a id="concat" href="#concat">#</a>
<em>op</em>.<b>concat</b>(<i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Merges two or more arrays in sequence, returning a new array.

* *values*: The arrays to merge.

<hr/><a id="join" href="#join">#</a>
<em>op</em>.<b>join</b>(<i>array</i>[, <i>delimiter</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Creates and returns a new string by concatenating all of the elements in an *array* (or an array-like object), separated by commas or a specified *delimiter* string. If the *array* has only one item, then that item will be returned without using the delimiter.

* *array*: The input array value.
* *join*: The delimiter string (default `','`).

<hr/><a id="includes" href="#includes">#</a>
<em>op</em>.<b>includes</b>(<i>array</i>, <i>value</i>[, <i>index</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Determines whether an *array* includes a certain *value* among its entries, returning `true` or `false` as appropriate.

* *array*: The input array value.
* *value*: The value to search for.
* *index*: The integer index to start searching from (default `0`).

<hr/><a id="indexof" href="#indexof">#</a>
<em>op</em>.<b>indexof</b>(<i>sequence</i>, <i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns the first index at which a given *value* can be found in the *sequence* (array or string), or -1 if it is not present.

* *sequence*: The input array or string value.
* *value*: The value to search for.

<hr/><a id="lastindexof" href="#lastindexof">#</a>
<em>op</em>.<b>lastindexof</b>(<i>sequence</i>, <i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns the last index at which a given *value* can be found in the *sequence* (array or string), or -1 if it is not present.

* *sequence*: The input array or string value.
* *value*: The value to search for.

<hr/><a id="length" href="#length">#</a>
<em>op</em>.<b>length</b>(<i>sequence</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns the length of the input *sequence* (array or string).

* *sequence*: The input array or string value.

<hr/><a id="pluck" href="#pluck">#</a>
<em>op</em>.<b>pluck</b>(<i>array</i>, <i>property</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns a new array in which the given *property* has been extracted for each element in the input *array*.

* *array*: The input array value.
* *property*: The property name string to extract. Nested properties are not supported: the input `"a.b"` will indicates a property with that exact name, *not* a nested property `"b"` of the object `"a"`.

<hr/><a id="slice" href="#slice">#</a>
<em>op</em>.<b>slice</b>(<i>sequence</i>[, <i>start</i>, <i>end</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns a copy of a portion of the input *sequence* (array or string) selected from *start* to *end* (*end* not included) where *start* and *end* represent the index of items in the sequence.

* *sequence*: The input array or string value.
* *start*: The starting integer index to copy from (inclusive, default `0`).
* *end*: The ending integer index to copy from (exclusive, default `sequence.length`).

<hr/><a id="reverse" href="#reverse">#</a>
<em>op</em>.<b>reverse</b>(<i>array</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/array.js)

Returns a new array with the element order reversed: the first *array* element becomes the last, and the last *array* element becomes the first. The input *array* is unchanged.

* *array*: The input array value.

<hr/><a id="sequence" href="#sequence">#</a>
<em>op</em>.<b>sequence</b>([<i>start</i>,] <i>stop</i>[, <i>step</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/sequence.js)

Returns an array containing an arithmetic sequence from the *start* value to the *stop* value, in *step* increments. If *step* is positive, the last element is the largest _start + i * step_ less than *stop*; if *step* is negative, the last element is the smallest _start + i * step_ greater than *stop*. If the returned array would contain an infinite number of values, an empty range is returned.

* *start*: The starting value of the sequence (default `0`).
* *stop*: The stopping value of the sequence. The stop value is exclusive; it is not included in the result.
* *step*: The step increment between sequence values (default `1`).


<br>

### <a id="date-functions">Date Functions</a>

<hr/><a id="now" href="#now">#</a>
<em>op</em>.<b>now</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the current time as the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.

<hr/><a id="timestamp" href="#timestamp">#</a>
<em>op</em>.<b>timestamp</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the timestamp for a *date* as the number of milliseconds elapsed since January 1, 1970 00:00:00 UTC.

* *date*: The input Date value.

<hr/><a id="datetime" href="#datetime">#</a>
<em>op</em>.<b>datetime</b>([<i>year</i>, <i>month</i>, <i>date</i>, <i>hours</i>, <i>minutes</i>, <i>seconds</i>, <i>milliseconds</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Creates and returns a new Date value. If no arguments are provided, the current date and time are used.

* *year*: The year.
* *month* The (zero-based) month (default `0`).
* *date* The date within the month (default `1`).
* hours: The hour within the day (default `0`).
* *minutes*: The minute within the hour (default `0`).
* *seconds*: The second within the minute (default `0`).
* *milliseconds*: The milliseconds within the second (default `0`).

<hr/><a id="year" href="#year">#</a>
<em>op</em>.<b>year</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the year of the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="quarter" href="#quarter">#</a>
<em>op</em>.<b>quarter</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the zero-based quarter of the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="month" href="#month">#</a>
<em>op</em>.<b>month</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the zero-based month of the specified *date* according to local time. A value of `0` indicates January, `1` indicates February, and so on.

* *date*: The input Date or timestamp value.

<hr/><a id="week" href="#week">#</a>
<em>op</em>.<b>week</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the Sunday-based week number of the year (0-53) for the specified *date* according to local time. All days in a new year preceding the first Sunday are considered to be in week 0.

* *date*: The input Date or timestamp value.

<hr/><a id="date" href="#date">#</a>
<em>op</em>.<b>date</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the date (day of month) of the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="dayofyear" href="#dayofyear">#</a>
<em>op</em>.<b>dayofyear</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the day of the year (1-366) of the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="dayofweek" href="#dayofweek">#</a>
<em>op</em>.<b>dayofweek</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the Sunday-based day of the week (0-6) of the specified *date* according to local time. A value of `0` indicates Sunday, `1` indicates Monday, and so on.

* *date*: The input Date or timestamp value.

<hr/><a id="hours" href="#hours">#</a>
<em>op</em>.<b>hours</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the hour of the day for the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="minutes" href="#minutes">#</a>
<em>op</em>.<b>minutes</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the minute of the hour for the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="seconds" href="#seconds">#</a>
<em>op</em>.<b>seconds</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the seconds of the minute for the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="milliseconds" href="#milliseconds">#</a>
<em>op</em>.<b>milliseconds</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the milliseconds of the second for the specified *date* according to local time.

* *date*: The input Date or timestamp value.

<hr/><a id="utcdatetime" href="#utcdatetime">#</a>
<em>op</em>.<b>utcdatetime</b>([<i>year</i>, <i>month</i>, <i>date</i>, <i>hours</i>, <i>minutes</i>, <i>seconds</i>, <i>milliseconds</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Creates and returns a new Date value using [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time). If no arguments are provided, the current date and time are used.

* *year*: The year.
* *month* The (zero-based) month (default `0`).
* *date* The date within the month (default `1`).
* hours: The hour within the day (default `0`).
* *minutes*: The minute within the hour (default `0`).
* *seconds*: The second within the minute (default `0`).
* *milliseconds*: The milliseconds within the second (default `0`).

<hr/><a id="utcyear" href="#utcyear">#</a>
<em>op</em>.<b>utcyear</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the year of the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcquarter" href="#utcquarter">#</a>
<em>op</em>.<b>utcquarter</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the zero-based quarter of the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcmonth" href="#utcmonth">#</a>
<em>op</em>.<b>utcmonth</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the zero-based month of the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time). A value of `0` indicates January, `1` indicates February, and so on.

* *date*: The input Date or timestamp value.

<hr/><a id="utcweek" href="#utcweek">#</a>
<em>op</em>.<b>utcweek</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the Sunday-based week number of the year (0-53) for the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time). All days in a new year preceding the first Sunday are considered to be in week 0.

* *date*: The input Date or timestamp value.

<hr/><a id="utcdate" href="#utcdate">#</a>
<em>op</em>.<b>utcdate</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the date (day of month) of the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcdayofyear" href="#utcdayofyear">#</a>
<em>op</em>.<b>utcdayofyear</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the day of the year (1-366) of the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcdayofweek" href="#utcdayofweek">#</a>
<em>op</em>.<b>utcdayofweek</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the Sunday-based day of the week (0-6) of the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time). A value of `0` indicates Sunday, `1` indicates Monday, and so on.

* *date*: The input Date or timestamp value.

<hr/><a id="utchours" href="#utchours">#</a>
<em>op</em>.<b>utchours</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the hour of the day for the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcminutes" href="#utcminutes">#</a>
<em>op</em>.<b>utcminutes</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the minute of the hour for the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcseconds" href="#utcseconds">#</a>
<em>op</em>.<b>utcseconds</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the seconds of the minute for the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="utcmilliseconds" href="#utcmilliseconds">#</a>
<em>op</em>.<b>utcmilliseconds</b>(<i>date</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns the milliseconds of the second for the specified *date* according to [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time).

* *date*: The input Date or timestamp value.

<hr/><a id="format_date" href="#format_date">#</a>
<em>op</em>.<b>format_date</b>(<i>date</i>[, <i>shorten</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string for the given *date* in local timezone. The resulting string is compatible with [parse_date](#parse_date) and JavaScript's built-in [Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).

* *date*: The input Date or timestamp value.
* *shorten*: A boolean flag (default `false`) indicating if the formatted string should be shortened if possible. For example, the local date `2001-01-01` will shorten from `"2001-01-01T00:00:00.000"` to `"2001-01-01T00:00"`.

<hr/><a id="format_utcdate" href="#format_utcdate">#</a>
<em>op</em>.<b>format_utcdate</b>(<i>date</i>[, <i>shorten</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/date.js)

Returns an [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted string for the given *date* in [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time). The resulting string is compatible with [parse_date](#parse_date) and JavaScript's built-in [Date.parse](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).

* *date*: The input Date or timestamp value.
* *shorten*: A boolean flag (default `false`) indicating if the formatted string should be shortened if possible. For example, the UTC date `2001-01-01` will shorten from `"2001-01-01T00:00:00.000Z"` to `"2001-01-01"`.

<br>

### <a id="json-functions">JSON Functions</a>

Functions for parsing and generating strings formatted using [JavaScript Object Notation (JSON)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON).

<hr/><a id="parse_json" href="#parse_json">#</a>
<em>op</em>.<b>parse_json</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/json.js)

Parses a string *value* in [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) format, constructing the JavaScript value or object described by the string.

* *value*: The input string value.

<hr/><a id="to_json" href="#to_json">#</a>
<em>op</em>.<b>to_json</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/json.js)

Converts a JavaScript object or value to a [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON) string.

* *value*: The value to convert to a JSON string.

<br>

### <a id="math-functions">Math Functions</a>

<hr/><a id="bin" href="#bin">#</a>
<em>op</em>.<b>bin</b>(<i>value</i>, <i>min</i>, <i>max</i>, <i>step</i>[, <i>offset</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/bin.js)

Truncate a *value* to a bin boundary. Useful for creating equal-width histograms. Values outside the `[min, max]` range will be mapped to `-Infinity` (*value &lt; min*) or `+Infinity` (*value > max*).

* *value*: The number value to bin.
* *min*: The minimum bin boundary value.
* *max*: The maximum bin boundary value.
* *step*: The step size between bin boundaries.
* *offset*: Offset in steps (default `0`) by which to adjust the returned bin value. An offset of `1` returns the next boundary.

<hr/><a id="random" href="#random">#</a>
<em>op</em>.<b>random</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/util/random.js)

Return a random floating point number between 0 (inclusive) and 1 (exclusive). By default uses [Math.random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random). Use the [seed](./#seed) method to instead use a seeded random number generator.

<hr/><a id="is_nan" href="#is_nan">#</a>
<em>op</em>.<b>is_nan</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Tests if the input *value* is not a number (`NaN`); equivalent to [Number.isNaN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN). The method will return `true` only if the input *value* is an actual numeric `NaN` value; it will return `false` for other types (booleans, strings, _etc_.).

* *value*: The value to test.

*Examples*

```js
op.is_nan(NaN) // true
op.is_nan(0/0) // true
op.is_nan(op.sqrt(-1)) // true
```

```js
op.is_nan('foo') // false
op.is_nan(+'foo') // true, coerce to number first
```

```js
op.is_nan(true) // false
op.is_nan(+true) // false, booleans coerce to numbers
```

```js
op.is_nan(undefined) // false
op.is_nan(+undefined) // true, coerce to number first
```

```js
op.is_nan(null) // false
op.is_nan(+null) // false, null coerces to zero
```

<hr/><a id="is_finite" href="#is_finite">#</a>
<em>op</em>.<b>is_finite</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Tests if the input *value* is finite; equivalent to [Number.isFinite](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite).

* *value*: The value to test.

<hr/><a id="abs" href="#abs">#</a>
<em>op</em>.<b>abs</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the absolute value of the input *value*; equivalent to [Math.abs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/abs).

* *value*: The input number value.

<hr/><a id="cbrt" href="#cbrt">#</a>
<em>op</em>.<b>cbrt</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the cube root value of the input *value*; equivalent to [Math.cbrt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cbrt).

* *value*: The input number value.

<hr/><a id="ceil" href="#ceil">#</a>
<em>op</em>.<b>ceil</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the ceiling of the input *value*, the nearest integer equal to or greater than the input; equivalent to [Math.ceil](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil).

* *value*: The input number value.

<hr/><a id="clz32" href="#clz32">#</a>
<em>op</em>.<b>clz32</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the number of leading zero bits in the 32-bit binary representation of a number *value*; equivalent to [Math.clz32](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/clz32).

* *value*: The input number value.

<hr/><a id="exp" href="#exp">#</a>
<em>op</em>.<b>exp</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns *e<sup>value</sup>*, where *e* is Euler's number, the base of the natural logarithm; equivalent to [Math.exp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/exp).

* *value*: The input number value.

<hr/><a id="expm1" href="#expm1">#</a>
<em>op</em>.<b>expm1</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns *e<sup>value</sup> - 1*, where *e* is Euler's number, the base of the natural logarithm; equivalent to [Math.expm1](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/expm1).

* *value*: The input number value.

<hr/><a id="floor" href="#floor">#</a>
<em>op</em>.<b>floor</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the floor of the input *value*, the nearest integer equal to or less than the input; equivalent to [Math.floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor).

* *value*: The input number value.

<hr/><a id="fround" href="#fround">#</a>
<em>op</em>.<b>fround</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the nearest 32-bit single precision float representation of the input number *value*; equivalent to [Math.fround](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/fround). Useful for translating between 64-bit `Number` values and values from a `Float32Array`.

* *value*: The input number value.

<hr/><a id="greatest" href="#greatest">#</a>
<em>op</em>.<b>greatest</b>(<i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the greatest (maximum) value among the input *values*; equivalent to [Math.max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max). This is _not_ an aggregate function, see [op.max](#max) to compute a maximum value across multiple rows.

* *values*: Zero or more input values.

<hr/><a id="least" href="#least">#</a>
<em>op</em>.<b>least</b>(<i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the least (minimum) value among the input *values*; equivalent to [Math.min](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min). This is _not_ an aggregate function, see [op.min](#min) to compute a minimum value across multiple rows.

* *values*: Zero or more input values.

<hr/><a id="log" href="#log">#</a>
<em>op</em>.<b>log</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the natural logarithm (base *e*) of a number *value*; equivalent to [Math.log](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log).

* *value*: The input number value.

<hr/><a id="log10" href="#log10">#</a>
<em>op</em>.<b>log10</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the base 10 logarithm of a number *value*; equivalent to [Math.log10](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log10).

* *value*: The input number value.

<hr/><a id="log1p" href="#log1p">#</a>
<em>op</em>.<b>log1p</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the natural logarithm (base *e*) of 1 + a number *value*; equivalent to [Math.log1p](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log1p).

* *value*: The input number value.

<hr/><a id="log2" href="#log2">#</a>
<em>op</em>.<b>log2</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the base 2 logarithm of a number *value*; equivalent to [Math.log2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log2).

* *value*: The input number value.

<hr/><a id="pow" href="#pow">#</a>
<em>op</em>.<b>pow</b>(<i>base</i>, <i>exponent</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the *base* raised to the *exponent* power, that is, *base*<sup>*exponent*</sup>; equivalent to [Math.pow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/pow).

* *base*: The base number value.
* *exponent*: The exponent number value.

<hr/><a id="round" href="#round">#</a>
<em>op</em>.<b>round</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the value of a number rounded to the nearest integer; ; equivalent to [Math.round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round).

* *value*: The input number value.

<hr/><a id="sign" href="#sign">#</a>
<em>op</em>.<b>sign</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns either a positive or negative +/- 1, indicating the sign of the input *value*; equivalent to [Math.sign](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sign).

* *value*: The input number value.

<hr/><a id="sqrt" href="#sqrt">#</a>
<em>op</em>.<b>sqrt</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the square root of the input *value*; equivalent to [Math.sqrt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt).

* *value*: The input number value.

<hr/><a id="trunc" href="#trunc">#</a>
<em>op</em>.<b>trunc</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the integer part of a number by removing any fractional digits; equivalent to [Math.trunc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc).

* *value*: The input number value.

<hr/><a id="degrees" href="#degrees">#</a>
<em>op</em>.<b>degrees</b>(<i>radians</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Converts the input *radians* value to degrees.

* *value*: The input number value in radians.

<hr/><a id="radians" href="#radians">#</a>
<em>op</em>.<b>radians</b>(<i>radians</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Converts the input *degrees* value to radians.

* *value*: The input number value in degrees.

<hr/><a id="acos" href="#acos">#</a>
<em>op</em>.<b>acos</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the arc-cosine (in radians) of a number *value*; equivalent to [Math.acos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acos).

* *value*: The input number value.

<hr/><a id="acosh" href="#acosh">#</a>
<em>op</em>.<b>acosh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic arc-cosine of a number *value*; equivalent to [Math.acosh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acosh).

* *value*: The input number value.

<hr/><a id="asin" href="#asin">#</a>
<em>op</em>.<b>asin</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the arc-sine (in radians) of a number *value*; equivalent to [Math.asin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asin).

* *value*: The input number value.

<hr/><a id="asinh" href="#asinh">#</a>
<em>op</em>.<b>asinh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic arc-sine of a number *value*; equivalent to [Math.asinh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asinh).

* *value*: The input number value.

<hr/><a id="atan" href="#atan">#</a>
<em>op</em>.<b>atan</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the arc-tangent (in radians) of a number *value*; equivalent to [Math.atan](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan).

* *value*: The input number value.

<hr/><a id="atan2" href="#atan2">#</a>
<em>op</em>.<b>atan2</b>(<i>y</i>, <i>x</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (*x*, *y*); ; equivalent to [Math.atan2](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan2).

* *y*: The y coordinate of the point.
* *x*: The x coordinate of the point.

<hr/><a id="atanh" href="#atanh">#</a>
<em>op</em>.<b>atanh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic arc-tangent of a number *value*; equivalent to [Math.atanh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh).

* *value*: The input number value.

<hr/><a id="cos" href="#cos">#</a>
<em>op</em>.<b>cos</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the cosine (in radians) of a number *value*; equivalent to [Math.cos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cos).

* *value*: The input number value.

<hr/><a id="cosh" href="#cosh">#</a>
<em>op</em>.<b>cosh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic cosine of a number *value*; equivalent to [Math.cosh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cosh).

* *value*: The input number value.

<hr/><a id="sin" href="#sin">#</a>
<em>op</em>.<b>sin</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the sine (in radians) of a number *value*; equivalent to [Math.sin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin).

* *value*: The input number value.

<hr/><a id="sinh" href="#sinh">#</a>
<em>op</em>.<b>sinh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic sine of a number *value*; equivalent to [Math.sinh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sinh).

* *value*: The input number value.

<hr/><a id="tan" href="#tan">#</a>
<em>op</em>.<b>tan</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the tangent (in radians) of a number *value*; equivalent to [Math.tan](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tan).

* *value*: The input number value.

<hr/><a id="tanh" href="#tanh">#</a>
<em>op</em>.<b>tanh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic tangent of a number *value*; equivalent to [Math.tanh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh).

* *value*: The input number value.


<br>

### <a id="object-functions">Object Functions</a>

<hr/><a id="equal" href="#equal">#</a>
<em>op</em>.<b>equal</b>(<i>a</i>, <i>b</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/equal.js)

Compare two values for equality, using join semantics in which `null !== null`. If the inputs are object-valued, a deep equality check of array entries or object key-value pairs is performed. The method is helpful within custom [join](verbs/#join) condition expressions.

* *a*: The first input to compare.
* *b*: The second input to compare.

<hr/><a id="has" href="#has">#</a>
<em>op</em>.<b>has</b>(<i>object</i>, <i>key</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns a boolean indicating whether the *object* has the specified *key* as its own property (as opposed to inheriting it). If the *object* is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) instance, the `has` method will be invoked directly on the object, otherwise `Object.hasOwnProperty` is used.

* *object*: The object, Map, or Set to test for property membership.
* *property*: The string property name to test for.

<hr/><a id="keys" href="#keys">#</a>
<em>op</em>.<b>keys</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns an array of a given *object*'s own enumerable property names. If the *object* is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) instance, the `keys` method will be invoked directly on the object, otherwise `Object.keys` is used.

* *object*: The input object or Map value.

<hr/><a id="values" href="#values">#</a>
<em>op</em>.<b>values</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns an array of a given *object*'s own enumerable property values. If the *object* is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) instance, the `values` method will be invoked directly on the object, otherwise `Object.values` is used.

* *object*: The input object, Map, or Set value.

<hr/><a id="entries" href="#entries">#</a>
<em>op</em>.<b>entries</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns an array of a given *object*'s own enumerable string-keyed property `[key, value]` pairs. If the *object* is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) or [Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set) instance, the `entries` method will be invoked directly on the object, otherwise `Object.entries` is used.

* *object*: The input object, Map, or Set value.

<hr/><a id="object" href="#object">#</a>
<em>op</em>.<b>object</b>(<i>entries</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns a new object given an iterable *entries* argument of `[key, value]` pairs. This method is Arquero's version of the standard [Object.fromEntries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries) method.

* *entries*: An iterable collection of `[key, value]` pairs, such as an array of two-element arrays or a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map).

<hr/><a id="recode" href="#recode">#</a>
<em>op</em>.<b>recode</b>(<i>value</i>, <i>map</i>[, <i>fallback</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/recode.js)

Recodes an input *value* to an alternative value, based on a provided value *map* object. If a *fallback* value is specified, it will be returned when the input value is not found in the map; otherwise, the input value is returned unchanged.

* *value*: The value to recode. The value must be safely coercible to a string for lookup against the value map.
* *map*: An object or [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) with input values for keys and recoded values for values. If a non-Map object, only the object's own properties will be considered; inherited properties on the prototype chain are ignored.
* *fallback*: An optional fallback value to use if the input value is not found in the value map. If a fallback is not specified, the input value will be returned unchanged when not found in the map.

*Examples*

```js
// recode values in a derive statement
table.derive({ val: d => op.recode(d.val, { 'opt:a': 'A', 'opt:b': 'B' }) })
```

```js
// define value map externally, bind as parameter
const map = { 'opt:a': 'A', 'opt:b': 'B' };
table
  .params({ map })
  .derive({ val: (d, $) => op.recode(d.val, $.map, '?') })
```

```js
// using a Map object, bind as parameter
const map = new Map().set('opt:a', 'A').set('opt:b', 'B');
table
  .params({ map })
  .derive({ val: (d, $) => op.recode(d.val, $.map, '?') })
```

<hr/><a id="row_object" href="#row_object">#</a>
<em>op</em>.<b>row_object</b>([<i>...columns</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/op-api.js)

Generate a new object containing the data for the current table row. The new object maps from column name keys to table values for the current row. The optional *columns* list indicates which columns to include in the object; if unspecified, all columns are included by default.

This method can only be invoked within a single-table expression. Calling this method in a multi-table expression (such as for a join) results in an error. An error will also result if any provided column names are specified using dynamic lookups of table column values.

* *columns*: A list of column names or indices to include in the object.

*Examples*

```js
aq.table({ a: [1, 3], b: [2, 4] })
  .derive({ row: op.row_object() })
  .get('row', 0); // { a: 1, b: 2 }
```

```js
// rollup a table into an array of row objects
table.rollup({ rows: d => op.array_agg(op.row_object()) })
```

<br>

### <a id="string-functions">String Functions</a>

<hr/><a id="parse_date" href="#parse_date">#</a>
<em>op</em>.<b>parse_date</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Parses a string *value* and returns a Date instance. Beware: this method uses JavaScript's [`Date.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) functionality, which is inconsistently implemented across browsers. That said, [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted strings such as those produced by [format_date](#format_date) and [format_utcdate](#format_utcdate) should be supported across platforms. Note that "bare" ISO date strings such as `"2001-01-01"` are interpreted by JavaScript as indicating midnight of that day in [Coordinated Universal Time (UTC)](https://en.wikipedia.org/wiki/Coordinated_Universal_Time), *not* local time. To indicate the local timezone, an ISO string can include additional time components and no `Z` suffix: `"2001-01-01T00:00"`.

* *value*: The input value.

<hr/><a id="parse_float" href="#parse_float">#</a>
<em>op</em>.<b>parse_float</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Parses a string *value* and returns a floating point number.

* *value*: The input value.

<hr/><a id="parse_int" href="#parse_int">#</a>
<em>op</em>.<b>parse_int</b>(<i>value</i>[, <i>radix</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Parses a string *value* and returns an integer of the specified radix (the base in mathematical numeral systems).

* *value*: The input value.
* *radix*: An integer between 2 and 36 that represents the radix (the base in mathematical numeral systems) of the string. Be careful: this does not default to 10! If *radix* is `undefined`, `0`, or unspecified, JavaScript assumes the following: If the input string begins with `"0x"` or `"0X"` (a zero, followed by lowercase or uppercase X), the radix is assumed to be 16 and the rest of the string is parsed as a hexidecimal number. If the input string begins with `"0"` (a zero), the radix is assumed to be 8 (octal) or 10 (decimal). Exactly which radix is chosen is implementation-dependent.  If the input string begins with any other value, the radix is 10 (decimal).

<hr/><a id="endswith" href="#endswith">#</a>
<em>op</em>.<b>endswith</b>(<i>value</i>, <i>search</i>[, <i>length</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Determines whether a string *value* ends with the characters of a specified *search* string, returning `true` or `false` as appropriate.

* *value*: The input string value.
* *search*: The search string to test for.
* *length*: If provided, used as the length of *value* (default `value.length`).

<hr/><a id="match" href="#match">#</a>
<em>op</em>.<b>match</b>(<i>value</i>, <i>regexp</i>[, <i>index</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Retrieves the result of matching a string *value* against a regular expression *regexp*. If no *index* is specified, returns an array whose contents depend on the presence or absence of the regular expression global (`g`) flag, or `null` if no matches are found. If the `g` flag is used, all results matching the complete regular expression will be returned, but capturing groups will not. If the `g` flag is not used, only the first complete match and its related capturing groups are returned.

If specified, the *index* looks up a value of the resulting match. If *index* is a number, the corresponding index of the result array is returned. If *index* is a string, the value of the corresponding [named capture group](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Groups_and_Ranges) is returned, or `null` if there is no such group.

* *value*: The input string value.
* *regexp*: The [regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) to match against.

*Examples*

```js
// returns ['1', '2', '3']
op.match('1 2 3', /\d+/g)
```

```js
// returns '2' (index into match array)
op.match('1 2 3', /\d+/g, 1)
```

```js
// returns '3' (index of capture group)
op.match('1 2 3', /\d+ \d+ (\d+)/, 1)
```

```js
// returns '2' (named capture group)
op.match('1 2 3', /\d+ (?<digit>\d+)/, 'digit')
```

<hr/><a id="normalize" href="#normalize">#</a>
<em>op</em>.<b>normalize</b>(<i>value</i>[, <i>form</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns the Unicode normalization form of the string *value*.

* *value*: The input string to normalize.
* *form*: The Unicode normalization form, one of `'NFC'` (default, canonical decomposition, followed by canonical composition), `'NFD'` (canonical decomposition), `'NFKC'` (compatibility decomposition, followed by canonical composition), or `'NFKD'` (compatibility decomposition).

<hr/><a id="padend" href="#padend">#</a>
<em>op</em>.<b>padend</b>(<i>value</i>, <i>length</i>[, <i>fill</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Pad a string *value* with a given *fill* string (applied from the end of *value* and repeated, if needed) so that the resulting string reaches a given *length*.

* *value*: The input string to pad.
* *length*: The length of the resulting string once the *value* string has been padded. If the length is lower than `value.length`, the *value* string will be returned as-is.
* *fill*: The string to pad the *value* string with (default `''`). If *fill* is too long to stay within the target *length*, it will be truncated: for left-to-right languages the left-most part and for right-to-left languages the right-most will be applied.

<hr/><a id="padstart" href="#padstart">#</a>
<em>op</em>.<b>padstart</b>(<i>value</i>, <i>length</i>[, <i>fill</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Pad a string *value* with a given *fill* string (applied from the start of *value* and repeated, if needed) so that the resulting string reaches a given *length*.

* *value*: The input string to pad.
* *length*: The length of the resulting string once the *value* string has been padded. If the length is lower than `value.length`, the *value* string will be returned as-is.
* *fill*: The string to pad the *value* string with (default `''`). If *fill* is too long to stay within the target *length*, it will be truncated: for left-to-right languages the left-most part and for right-to-left languages the right-most will be applied.

<hr/><a id="lower" href="#lower">#</a>
<em>op</em>.<b>lower</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns the string *value* converted to lower case.

* *value*: The input string value.

<hr/><a id="upper" href="#upper">#</a>
<em>op</em>.<b>upper</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns the string *value* converted to upper case.

* *value*: The input string value.

<hr/><a id="repeat" href="#repeat">#</a>
<em>op</em>.<b>repeat</b>(<i>value</i>, <i>number</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns a new string which contains the specified *number* of copies of the *value* string concatenated together.

* *value*: The input string to repeat.
* *number*: An integer between `0` and `+Infinity`, indicating the number of times to repeat the string.

<hr/><a id="replace" href="#replace">#</a>
<em>op</em>.<b>replace</b>(<i>value</i>, <i>pattern</i>, <i>replacement</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns a new string with some or all matches of a *pattern* replaced by a *replacement*. The *pattern* can be a string or a regular expression, and the *replacement* must be a string. If *pattern* is a string, only the first occurrence will be replaced; to make multiple replacements, use a regular expression *pattern* with a `g` (global) flag.

* *value*: The input string value.
* *pattern*: The pattern string or regular expression to replace.
* *replacement*: The replacement string to use.

<hr/><a id="split" href="#split">#</a>
<em>op</em>.<b>split</b>(<i>value</i>, <i>separator</i>[, <i>limit</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Divides a string *value* into an ordered list of substrings based on a *separator* pattern, puts these substrings into an array, and returns the array.

* *value*: The input string value.
* *separator*: A string or regular expression pattern describing where each split should occur.
* *limit*: An integer specifying a limit on the number of substrings to be included in the array.

<hr/><a id="startswith" href="#startswith">#</a>
<em>op</em>.<b>startswith</b>(<i>value</i>, <i>search</i>[, <i>position</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Determines whether a string *value* starts with the characters of a specified *search* string, returning `true` or `false` as appropriate.

* *value*: The input string value.
* *search*: The search string to test for.
* *position*: The position in the *value* string at which to begin searching (default `0`).

<hr/><a id="substring" href="#substring">#</a>
<em>op</em>.<b>substring</b>(<i>value</i>[, <i>start</i>, <i>end</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns the part of the string *value* between the *start* and *end* indexes, or to the end of the string.

* *value*: The input string value.
* *start*: The index of the first character to include in the returned substring (default `0`).
* *end*: The index of the first character to exclude from the returned substring (default `value.length`).

<hr/><a id="trim" href="#trim">#</a>
<em>op</em>.<b>trim</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns a new string with whitespace removed from both ends of the input *value* string. Whitespace in this context is all the whitespace characters (space, tab, no-break space, etc.) and all the line terminator characters (LF, CR, etc.).

* *value*: The input string value to trim.


<br/>

## <a id="aggregate-functions">Aggregate Functions</a>

Aggregate table expression functions for summarizing values. If invoked outside a table expression context, column (field) inputs must be column name strings, and the operator will return a corresponding table expression.

<hr/><a id="any" href="#any">#</a>
<em>op</em>.<b>any</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function returning an arbitrary observed value (typically the first encountered).

* *field*: The data column or derived field.

<hr/><a id="bins" href="#bins">#</a>
<em>op</em>.<b>bins</b>(<i>field</i>[, <i>maxbins</i>, <i>nice</i>, <i>minstep</i>, <i>step</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for calculating a binning scheme in terms of the minimum bin boundary, maximum bin boundary, and step size.

* *field*: The data column or derived field.
* *maxbins*: The maximum number of allowed bins (default `15`).
* *nice*: Boolean flag (default `true`) indicating if the bin min and max should snap to "nice" human-friendly values such as multiples of 10.
* *minstep*: The minimum allowed step size between bins.
* *step*: The exact step size to use between bins. If specified, the *maxbins* and *minstep* arguments are ignored.

<hr/><a id="count" href="#count">#</a>
<em>op</em>.<b>count</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of records (rows).

<hr/><a id="distinct" href="#distinct">#</a>
<em>op</em>.<b>distinct</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of distinct values.

* *field*: The data column or derived field.

<hr/><a id="valid" href="#valid">#</a>
<em>op</em>.<b>valid</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of valid values. Invalid values are `null`, `undefined`, or `NaN`.

* *field*: The data column or derived field.

<hr/><a id="invalid" href="#invalid">#</a>
<em>op</em>.<b>invalid</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of invalid values. Invalid values are `null`, `undefined`, or `NaN`.

* *field*: The data column or derived field.

<hr/><a id="max" href="#max">#</a>
<em>op</em>.<b>max</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the maximum value. For a non-aggregate version, see [op.greatest](#greatest).

* *field*: The data column or derived field.

<hr/><a id="min" href="#min">#</a>
<em>op</em>.<b>min</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the minimum value. For a non-aggregate version, see [op.least](#least).

* *field*: The data column or derived field.

<hr/><a id="sum" href="#sum">#</a>
<em>op</em>.<b>sum</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to sum values.

* *field*: The data column or derived field.

<hr/><a id="product" href="#product">#</a>
<em>op</em>.<b>product</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to multiply values.

* *field*: The data column or derived field.

<hr/><a id="mean" href="#mean">#</a>
<em>op</em>.<b>mean</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the mean (average) value. This operator is a synonym for [average](#average).

* *field*: The data column or derived field.

<hr/><a id="average" href="#average">#</a>
<em>op</em>.<b>average</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the average (mean) value. This operator is a synonym for [mean](#mean).

* *field*: The data column or derived field.

<hr/><a id="mode" href="#mode">#</a>
<em>op</em>.<b>mode</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to determine the mode (most frequent) value.

* *field*: The data column or derived field.

<hr/><a id="median" href="#median">#</a>
<em>op</em>.<b>median</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the median value. This operation is a shorthand for the [quantile](#quantile) value at p = 0.5.

* *field*: The data column or derived field.

<hr/><a id="quantile" href="#quantile">#</a>
<em>op</em>.<b>quantile</b>(<i>field</i>, <i>p</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to compute the quantile boundary of a data field for a probability threshold. The [median](#median) is the value of quantile at p = 0.5.

* *field*: The data column or derived field.
* *p*: The probability threshold.

<hr/><a id="stdev" href="#stdev">#</a>
<em>op</em>.<b>stdev</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the sample standard deviation.

* *field*: The data column or derived field.

<hr/><a id="stdevp" href="#stdevp">#</a>
<em>op</em>.<b>stdevp</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the population standard deviation.

* *field*: The data column or derived field.

<hr/><a id="variance" href="#variance">#</a>
<em>op</em>.<b>variance</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the sample variance.

* *field*: The data column or derived field.

<hr/><a id="variancep" href="#variancep">#</a>
<em>op</em>.<b>variancep</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the population variance.

<hr/><a id="corr" href="#corr">#</a>
<em>op</em>.<b>corr</b>(<i>field1</i>, <i>field2</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the [product-moment correlation](https://en.wikipedia.org/wiki/Pearson_correlation_coefficient) between two variables. To instead compute a [rank correlation](https://en.wikipedia.org/wiki/Spearman%27s_rank_correlation_coefficient), compute the average ranks for each variable and then apply this function to the result.

* *field1*: The first data column or derived field.
* *field2*: The second data column or derived field.

<hr/><a id="covariance" href="#covariance">#</a>
<em>op</em>.<b>covariance</b>(<i>field1</i>, <i>field2</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the sample covariance between two variables.

* *field1*: The first data column or derived field.
* *field2*: The second data column or derived field.

<hr/><a id="covariancep" href="#covariancep">#</a>
<em>op</em>.<b>covariancep</b>(<i>field1</i>, <i>field2</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the population covariance between two variables.

* *field1*: The first data column or derived field.
* *field2*: The second data column or derived field.

<hr/><a id="array_agg" href="#array_agg">#</a>
<em>op</em>.<b>array_agg</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to collect an array of *field* values. The resulting aggregate is an array (one per group) containing all observed values. The order of values is sensitive to any [orderby](verbs#orderby) criteria.

* *field*: The data column or derived field.

*Examples*

```js
aq.table({ v: [1, 2, 3, 1] })
  .rollup({ a: op.array_agg('v') }) // a: [ [1, 2, 3, 1] ]
```

<hr/><a id="array_agg_distinct" href="#array_agg_distinct">#</a>
<em>op</em>.<b>array_agg_distinct</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to collect an array of distinct (unique) *field* values. The resulting aggregate is an array (one per group) containing all unique values. The order of values is sensitive to any [orderby](verbs#orderby) criteria.

* *field*: The data column or derived field.

*Examples*

```js
aq.table({ v: [1, 2, 3, 1] })
  .rollup({ a: op.array_agg_distinct('v') }) // a: [ [1, 2, 3] ]
```

<hr/><a id="object_agg" href="#object_agg">#</a>
<em>op</em>.<b>object_agg</b>(<i>key</i>, <i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to create an object given input *key* and *value* fields. The resulting aggregate is an object (one per group) with keys and values defined by the input fields. For any keys that occur multiple times in a group, the most recently observed value is used. The order in which keys and values are observed is sensitive to any [orderby](verbs#orderby) criteria.

* *key*: The object key field, should be a string or string-coercible value.
* *value* The object value field.

*Examples*

```js
aq.table({ k: ['a', 'b', 'a'], v: [1, 2, 3] })
  .rollup({ o: op.object_agg('k', 'v') }) // o: [ { a: 3, b: 2 } ]
```

<hr/><a id="map_agg" href="#map_agg">#</a>
<em>op</em>.<b>map_agg</b>(<i>key</i>, <i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to create a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) given input *key* and *value* fields. The resulting aggregate is a Map (one per group) with keys and values defined by the input fields. For any keys that occur multiple times in a group, the most recently observed value is used. The order in which keys and values are observed is sensitive to any [orderby](verbs#orderby) criteria.

* *key*: The key field.
* *value* The value field.

*Examples*

```js
aq.table({ k: ['a', 'b', 'a'], v: [1, 2, 3] })
  .rollup({ m: op.map_agg('k', 'v') }) // m: [ new Map([['a', 3], ['b', 2]]) ]
```

<hr/><a id="entries_agg" href="#entries_agg">#</a>
<em>op</em>.<b>entries_agg</b>(<i>key</i>, <i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to create an array in the style of [Object.entries](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries) given input *key* and *value* fields. The resulting aggregate is an array (one per group) with [key, value] arrays defined by the input fields, and may include duplicate keys. The order of entries is sensitive to any [orderby](verbs#orderby) criteria.

* *key*: The key field.
* *value* The value field.

*Examples*

```js
aq.table({ k: ['a', 'b', 'a'], v: [1, 2, 3] })
  .rollup({ e: op.entries_agg('k', 'v') }) // e: [ [['a', 1], ['b', 2], ['a', 3]] ]
```

<br/>

## <a id="window-functions">Window Functions</a>

Window table expression functions applicable over ordered table rows. If invoked outside a table expression context, column (field) inputs must be column name strings, and the operator will return a corresponding table expression.

<hr/><a id="row_number" href="#row_number">#</a>
<em>op</em>.<b>row_number</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign consecutive row numbers, starting from 1.

<hr/><a id="rank" href="#rank">#</a>
<em>op</em>.<b>rank</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a rank to each value in a group, starting from 1. Peer values are assigned the same rank. Subsequent ranks reflect the number of prior values: if the first two values tie for rank 1, the third value is assigned rank 3.

<hr/><a id="avg_rank" href="#avg_rank">#</a>
<em>op</em>.<b>avg_rank</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a fractional (average) rank to each value in a group, starting from 1. Peer values are assigned the average of their indices: if the first two values tie, both will be assigned rank 1.5.

<hr/><a id="dense_rank" href="#dense_rank">#</a>
<em>op</em>.<b>dense_rank</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a dense rank to each value in a group, starting from 1. Peer values are assigned the same rank. Subsequent ranks do not reflect the number of prior values: if the first two values tie for rank 1, the third value is assigned rank 2.

<hr/><a id="percent_rank" href="#percent_rank">#</a>
<em>op</em>.<b>percent_rank</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a percentage rank to each value in a group. The percent is calculated as *(rank - 1) / (group_size - 1)*.

<hr/><a id="cume_dist" href="#cume_dist">#</a>
<em>op</em>.<b>cume_dist</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a cumulative distribution value between 0 and 1 to each value in a group.

<hr/><a id="ntile" href="#ntile">#</a>
<em>op</em>.<b>ntile</b>(<i>num</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a quantile (e.g., percentile) value to each value in a group. Accepts an integer parameter indicating the number of buckets to use (e.g., 100 for percentiles, 5 for quintiles).

* *num*: The number of buckets for ntile calculation.

<hr/><a id="lag" href="#lag">#</a>
<em>op</em>.<b>lag</b>(<i>field</i>[, <i>offset</i>, <i>defaultValue</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a value that precedes the current value by a specified number of positions. If no such value exists, returns a default value instead.

* *field*: The data column or derived field.
* *offset*: The lag offset (default `1`) from the current value.
* *defaultValue*: The default value (default `undefined`).

<hr/><a id="lead" href="#lead">#</a>
<em>op</em>.<b>lead</b>(<i>field</i>[, <i>offset</i>, <i>defaultValue</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign a value that follows the current value by a specified number of positions. If no such value exists, returns a default value instead.

* *field*: The data column or derived field.
* *offset*: The lead offset (default `1`) from the current value.
* *defaultValue*: The default value (default `undefined`).

<hr/><a id="first_value" href="#first_value">#</a>
<em>op</em>.<b>first_value</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign the first value in a sliding window frame.

* *field*: The data column or derived field.

<hr/><a id="last_value" href="#last_value">#</a>
<em>op</em>.<b>last_value</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign the last value in a sliding window frame.

* *field*: The data column or derived field.

<hr/><a id="nth_value" href="#nth_value">#</a>
<em>op</em>.<b>nth_value</b>(<i>field</i>[, <i>nth</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to assign the nth value in a sliding window frame (counting from 1), or `undefined` if no such value exists.

* *field*: The data column or derived field.
* *nth*: The nth position, starting from 1.

<hr/><a id="fill_down" href="#fill_down">#</a>
<em>op</em>.<b>fill_down</b>(<i>field</i>[, <i>defaultValue</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to fill in missing values with preceding values. Returns the value at the current window position if it is valid (not `null`, `undefined`, or `NaN`), otherwise returns the first preceding valid value. If no such value exists, returns the default value.

* *field*: The data column or derived field.
* *defaultValue*: The default value (default `undefined`).

<hr/><a id="fill_up" href="#fill_up">#</a>
<em>op</em>.<b>fill_up</b>(<i>field</i>[, <i>defaultValue</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/window-functions.js)

Window function to fill in missing values with subsequent values. Returns the value at the current window position if it is valid (not `null`, `undefined`, or `NaN`), otherwise returns the first subsequent valid value. If no such value exists, returns the default value.

* *field*: The data column or derived field.
* *defaultValue*: The default value (default `undefined`).

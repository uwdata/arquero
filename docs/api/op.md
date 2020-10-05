---
title: Operations \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [Table](table) | [Verbs](verbs) | [**Op Functions**](op) | [Expressions](expressions)

* [Standard Functions](#functions)
  * [Array Functions](#array-functions)
  * [Date Functions](#date-functions)
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
  * [values](#values), [unique](#unique)
* [Window Functions](#window-functions)
  * [row_number](#row_number), [rank](#rank), [avg_rank](#avg_rank), [dense_rank](#dense_rank)
  * [percent_rank](#percent_rank), [cume_dist](#cume_dist), [ntile](#ntile)
  * [lag](#lag), [lead](#lead), [first_value](#first_value), [last_value](#last_value), [nth_value](#nth_value)

<br/>

## <a id="functions">Standard Functions</a>

Standard library of table expression functions. The [`op` object](./#op) exports these as standard JavaScript functions that behave the same whether invoked inside or outside a table expression context.

### <a id="array-functions">Array Functions</a>

<hr/><a id="concat" href="#concat">#</a>
<em>op</em>.<b>concat</b>(<i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/sequence.js)

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
* *index*: The integer index to start searcing from (default `0`).

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

Return a random floating point number between 0 (inclusive) and 1 (exclusive). By default uses `Math.random`. Use the [seed](./#seed) method to instead use a seeded random number generator.

<hr/><a id="is_nan" href="#is_nan">#</a>
<em>op</em>.<b>is_nan</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Tests if the input *value* is not a number (`NaN`).

* *value*: The value to test.

<hr/><a id="is_finite" href="#is_finite">#</a>
<em>op</em>.<b>is_finite</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Tests if the input *value* is finite.

* *value*: The value to test.

<hr/><a id="abs" href="#abs">#</a>
<em>op</em>.<b>abs</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the absolute value of the input *value*.

* *value*: The input number value.

<hr/><a id="cbrt" href="#cbrt">#</a>
<em>op</em>.<b>cbrt</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the cube root value of the input *value*.

* *value*: The input number value.

<hr/><a id="ceil" href="#ceil">#</a>
<em>op</em>.<b>ceil</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the ceiling of the input *value*, the nearest integer equal to or greater than the input.

* *value*: The input number value.

<hr/><a id="clz32" href="#clz32">#</a>
<em>op</em>.<b>clz32</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the number of leading zero bits in the 32-bit binary representation of a number *value*.

* *value*: The input number value.

<hr/><a id="exp" href="#exp">#</a>
<em>op</em>.<b>exp</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns *e<sup>value</sup>*, where *e* is Euler's number, the base of the natural logarithm.

* *value*: The input number value.

<hr/><a id="exp" href="#expm1">#</a>
<em>op</em>.<b>expm1</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns *e<sup>value</sup> - 1*, where *e* is Euler's number, the base of the natural logarithm.

* *value*: The input number value.

<hr/><a id="floor" href="#floor">#</a>
<em>op</em>.<b>floor</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the floor of the input *value*, the nearest integer equal to or less than the input.

* *value*: The input number value.

<hr/><a id="fround" href="#fround">#</a>
<em>op</em>.<b>fround</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the nearest 32-bit single precision float representation of the input number *value*. Useful for translating between 64-bit `Number` values and values from a `Float32Array`.

* *value*: The input number value.

<hr/><a id="log" href="#log">#</a>
<em>op</em>.<b>log</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the natural logarithm (base *e*) of a number *value*.

* *value*: The input number value.

<hr/><a id="log10" href="#log10">#</a>
<em>op</em>.<b>log10</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the base 10 logarithm of a number *value*.

* *value*: The input number value.

<hr/><a id="log1p" href="#log1p">#</a>
<em>op</em>.<b>log1p</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the natural logarithm (base *e*) of 1 + a number *value*.

* *value*: The input number value.

<hr/><a id="log2" href="#log2">#</a>
<em>op</em>.<b>log2</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the base 2 logarithm of a number *value*.

* *value*: The input number value.

<hr/><a id="max" href="#max">#</a>
<em>op</em>.<b>max</b>(<i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the largest (maximum) value among the input *values*.

* *values*: Zero or more input values.

<hr/><a id="min" href="#min">#</a>
<em>op</em>.<b>min</b>(<i>...values</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the smallest (minimum) value among the input *values*.

* *values*: Zero or more input values.

<hr/><a id="pow" href="#pow">#</a>
<em>op</em>.<b>pow</b>(<i>base</i>, <i>exponent</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the *base* raised to the *exponent* power, that is, *base*<sup>*exponent*</sup>.

* *base*: The base number value.
* *exponent*: The exponent number value.

<hr/><a id="round" href="#round">#</a>
<em>op</em>.<b>round</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the value of a number rounded to the nearest integer.

* *value*: The input number value.

<hr/><a id="sign" href="#sign">#</a>
<em>op</em>.<b>sign</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns either a positive or negative +/- 1, indicating the sign of the input *value*.

* *value*: The input number value.

<hr/><a id="sqrt" href="#sqrt">#</a>
<em>op</em>.<b>sqrt</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the square root of the input *value*.

* *value*: The input number value.

<hr/><a id="trunc" href="#trunc">#</a>
<em>op</em>.<b>trunc</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the integer part of a number by removing any fractional digits.

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

Returns the arc-cosine (in radians) of a number *value*.

* *value*: The input number value.

<hr/><a id="acosh" href="#acosh">#</a>
<em>op</em>.<b>acosh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic arc-cosine of a number *value*.

* *value*: The input number value.

<hr/><a id="asin" href="#asin">#</a>
<em>op</em>.<b>asin</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the arc-sine (in radians) of a number *value*.

* *value*: The input number value.

<hr/><a id="asinh" href="#asinh">#</a>
<em>op</em>.<b>asinh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic arc-sine of a number *value*.

* *value*: The input number value.

<hr/><a id="atan" href="#atan">#</a>
<em>op</em>.<b>atan</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the arc-tangent (in radians) of a number *value*.

* *value*: The input number value.

<hr/><a id="atan2" href="#atan2">#</a>
<em>op</em>.<b>atan2</b>(<i>y</i>, <i>x</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the angle in the plane (in radians) between the positive x-axis and the ray from (0, 0) to the point (*x*, *y*).

* *y*: The y coordinate of the point.
* *x*: The x coordinate of the point.

<hr/><a id="atanh" href="#atanh">#</a>
<em>op</em>.<b>atanh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic arc-tangent of a number *value*.

* *value*: The input number value.

<hr/><a id="cos" href="#cos">#</a>
<em>op</em>.<b>cos</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the cosine (in radians) of a number *value*.

* *value*: The input number value.

<hr/><a id="cosh" href="#cosh">#</a>
<em>op</em>.<b>cosh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic cosine of a number *value*.

* *value*: The input number value.

<hr/><a id="sin" href="#sin">#</a>
<em>op</em>.<b>sin</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the sine (in radians) of a number *value*.

* *value*: The input number value.

<hr/><a id="sinh" href="#sinh">#</a>
<em>op</em>.<b>sinh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic sine of a number *value*.

* *value*: The input number value.

<hr/><a id="tan" href="#tan">#</a>
<em>op</em>.<b>tan</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the tangent (in radians) of a number *value*.

* *value*: The input number value.

<hr/><a id="tanh" href="#tanh">#</a>
<em>op</em>.<b>tanh</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/math.js)

Returns the hyperbolic tangent of a number *value*.

* *value*: The input number value.


<br>

### <a id="object-functions">Object Functions</a>

<hr/><a id="equal" href="#equal">#</a>
<em>op</em>.<b>equal</b>(<i>a</i>, <i>b</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/equal.js)

Compare two values for equality, using join semantics in which `null !== null`. If the inputs are object-valued, a deep equality check of array entries or object key-value pairs is performed. The method is helpful within custom [join](verbs/#join) condition expressions.

* *a*: The first input to compare.
* *b*: The second input to compare.

<hr/><a id="has" href="#has">#</a>
<em>op</em>.<b>has</b>(<i>object</i>, <i>property</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns a boolean indicating whether the *object* has the specified *property* as its own property (as opposed to inheriting it).

* *object*: The object to test for property membership.
* *property*: The string property name to test for.

<hr/><a id="keys" href="#keys">#</a>
<em>op</em>.<b>keys</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns an array of a given *object*'s own enumerable property names.

* *object*: The input object value.

<hr/><a id="values" href="#values">#</a>
<em>op</em>.<b>values</b>(<i>object</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/object.js)

Returns an array of a given *object*'s own enumerable property values.

* *values*: The input object value.

<br>

### <a id="string-functions">String Functions</a>

<hr/><a id="parse_date" href="#parse_date">#</a>
<em>op</em>.<b>parse_date</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Parses a string *value* and returns a Date instance. Beware: this method uses JavaScript's [`Date.parse()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse) functionality, which is inconsistently implemented across browsers. Use this method at your own peril.

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
<em>op</em>.<b>match</b>(<i>regexp</i>, <i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Retrieves the result of matching a string *value* against a regular expression *regexp*. Returns `true` if the string is found, `false` otherwise.

* *regexp*: The regular expression to test with.
* *value*: The input string to search for matches.

<hr/><a id="lower" href="#lower">#</a>
<em>op</em>.<b>lower</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns the string *value* converted to lower case.

* *value*: The input string value.

<hr/><a id="upper" href="#upper">#</a>
<em>op</em>.<b>upper</b>(<i>value</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/functions/string.js)

Returns the string *value* converted to upper case.

* *value*: The input string value.

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
<em>op</em>.<b>bins</b>(<i>field</i>[, <i>maxbins</i>, <i>nice</i>, <i>minstep</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for calculating a binning scheme in terms of the minimum bin boundary, maximum bin boundary, and step size.

* *field*: The data column or derived field.
* *maxbins*: The maximum number of allowed bins (default `15`).
* *nice*: Boolean flag (default `true`) indicating if the bin min and max should snap to "nice" human-friendly values such as multiples of 10.
* *minstep*: The minimum allowed step size between bins.

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

Aggregate function for the maximum value.

* *field*: The data column or derived field.

<hr/><a id="min" href="#min">#</a>
<em>op</em>.<b>min</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the minimum value.

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

<hr/><a id="values" href="#values">#</a>
<em>op</em>.<b>values</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to collect an array of values. The resulting aggregate is an array containing all observed values.

* *field*: The data column or derived field.

<hr/><a id="unique" href="#unique">#</a>
<em>op</em>.<b>unique</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to collect an array of unique values. The resulting aggregate is an array containing all unique values.

* *field*: The data column or derived field.

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
<em>op</em>.<b>ntile</b>(<i>num</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Window function to assign a quantile (e.g., percentile) value to each value in a group. Accepts an integer parameter indicating the number of buckets to use (e.g., 100 for percentiles, 5 for quintiles).

* *num*: The number of buckets for ntile calculation.

<hr/><a id="lag" href="#lag">#</a>
<em>op</em>.<b>lag</b>(<i>field</i>[, <i>offset</i>, <i>defaultValue</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Window function to assign a value that precedes the current value by a specified number of positions. If no such value exists, returns a default value instead.

* *field*: The data column or derived field.
* *offset*: The lag offset (default `1`) from the current value.
* *defaultValue*: The default value (default `undefined`).

<hr/><a id="lead" href="#lead">#</a>
<em>op</em>.<b>lead</b>(<i>field</i>[, <i>offset</i>, <i>defaultValue</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Window function to assign a value that follows the current value by a specified number of positions. If no such value exists, returns a default value instead.

* *field*: The data column or derived field.
* *offset*: The lead offset (default `1`) from the current value.
* *defaultValue*: The default value (default `undefined`).

<hr/><a id="first_value" href="#first_value">#</a>
<em>op</em>.<b>first_value</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Window function to assign the first value in a sliding window frame.

* *field*: The data column or derived field.

<hr/><a id="last_value" href="#last_value">#</a>
<em>op</em>.<b>first_value</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Window function to assign the last value in a sliding window frame.

* *field*: The data column or derived field.

<hr/><a id="nth_value" href="#nth_value">#</a>
<em>op</em>.<b>nth_value</b>(<i>field</i>[, <i>nth</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/verbs/index.js)

Window function to assign the nth value in a sliding window frame (counting from 1), or `undefined` if no such value exists.

* *field*: The data column or derived field.
* *nth*: The nth position, starting from 1.

# Arquero Operations Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level API](/arquero/api) | [Table](table) | [Verbs](verbs) | [**Operations**](op)

* [Standard Functions](#functions)
* [Aggregate Functions](#aggregate)
* [Window Functions](#window)

<br/>

## <a name="functions">Standard Functions</a>

Under construction!

<br/>

## <a name="aggregate">Aggregate Functions</a>

Aggregate table expression functions for summarizing values. If invoked outside a table expression context, column (field) inputs must be column name strings, and the operator will return a corresponding table expression.

<hr/><a id="any" href="#any">#</a>
<em>op</em>.<b>any</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function returning an arbitrary observed value (typically the first encountered).

* *field*: The data column or derived field.

<hr/><a id="average" href="#average">#</a>
<em>op</em>.<b>average</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the average (mean) value. This operator is a synonym for [mean](#mean).

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

<hr/><a id="distinct" href="#distinct">#</a>
<em>op</em>.<b>distinct</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of distinct values.

* *field*: The data column or derived field.

<hr/><a id="invalid" href="#invalid">#</a>
<em>op</em>.<b>invalid</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of invalid values. Invalid values are `null`, `undefined`, or `NaN`.

* *field*: The data column or derived field.

<hr/><a id="max" href="#max">#</a>
<em>op</em>.<b>max</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the maximum value.

* *field*: The data column or derived field.

<hr/><a id="mean" href="#mean">#</a>
<em>op</em>.<b>mean</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the mean (average) value. This operator is a synonym for [average](#average).

* *field*: The data column or derived field.

<hr/><a id="median" href="#median">#</a>
<em>op</em>.<b>median</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the median value. This operation is a shorthand for the [quantile](#quantile) value at p = 0.5.

* *field*: The data column or derived field.

<hr/><a id="min" href="#min">#</a>
<em>op</em>.<b>min</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the minimum value.

* *field*: The data column or derived field.

<hr/><a id="mode" href="#mode">#</a>
<em>op</em>.<b>mode</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to determine the mode (most frequent) value.

* *field*: The data column or derived field.

<hr/><a id="product" href="#product">#</a>
<em>op</em>.<b>product</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to multiply values.

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

<hr/><a id="sum" href="#sum">#</a>
<em>op</em>.<b>sum</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to sum values.

* *field*: The data column or derived field.

<hr/><a id="unique" href="#unique">#</a>
<em>op</em>.<b>unique</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to collect an array of unique values. The resulting aggregate is an array containing all unique values.

* *field*: The data column or derived field.

<hr/><a id="valid" href="#valid">#</a>
<em>op</em>.<b>valid</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to count the number of valid values. Invalid values are `null`, `undefined`, or `NaN`.

* *field*: The data column or derived field.

<hr/><a id="values" href="#values">#</a>
<em>op</em>.<b>values</b>() · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function to collect an array of values. The resulting aggregate is an array containing all observed values.

* *field*: The data column or derived field.

<hr/><a id="variance" href="#variance">#</a>
<em>op</em>.<b>variance</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the sample variance.

* *field*: The data column or derived field.

<hr/><a id="variancep" href="#variancep">#</a>
<em>op</em>.<b>variancep</b>(<i>field</i>) · [Source](https://github.com/uwdata/arquero/blob/master/src/op/aggregate-functions.js)

Aggregate function for the population variance.

<br/>

## <a name="window">Window Functions</a>

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
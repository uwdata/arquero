---
title: Extensibility \| Arquero API Reference
---
# Arquero API Reference <a href="https://idl.uw.edu/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [Table](table) | [Verbs](verbs) | [Op Functions](op) | [Expressions](expressions) | [**Extensibility**](extensibility)

* [Op Functions](#op-functions)
  * [addFunction](#addFunction)
  * [addAggregateFunction](#addAggregateFunction)
  * [addWindowFunction](#addWindowFunction)
* [Table Methods](#table-methods)
  * [addTableMethod](#addTableMethod)
  * [addVerb](#addVerb)
* [Package Bundles](#packages)
  * [addPackage](#addPackage)
* [Table Methods](#table-methods)

<br/>

## <a id="op-functions">Op Functions</a>

Add new functions for use in table expressions.

<hr/><a id="addFunction" href="#addFunction">#</a>
<em>aq</em>.<b>addFunction</b>([<i>name</i>,] <i>fn</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a function for use within table expressions. If only a single argument is provided, it will be assumed to be a function and the system will try to extract its name. Throws an error if a function with the same name is already registered and the override option is not specified, or if no name is provided and the input function is anonymous. After registration, the function will be accessible via the [`op`](#op) object.

Also see the [`escape()` expression helper](./#escape) for a lightweight alternative that allows access to functions defined in an enclosing scope.

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
<em>aq</em>.<b>addAggregateFunction</b>(<i>name</i>, <i>def</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a custom aggregate function. Throws an error if a function with the same name is already registered and the override option is not specified. After registration, the operator will be accessible via the [`op`](#op) object.

In addition to column values, internally aggregate functions are passed a `state` object that tracks intermediate values throughout the aggregation. Each [groupby](verbs/#groupby) group receives a different state object. The state object always has a `count` property (total number of values, including invalid values) and a `valid` property (number of values that are not `null`, `undefined`, or `NaN`). Each aggregate operator may write intermediate values to the `state` object. Follow the property naming convention of using the aggregate function name as a property name prefix to avoid namespace collisions! For example, the `mean` aggregate function writes to the properties `state.mean` and `state.mean_d`.

The `rem` function of an aggregate definition is used to support rolling window calculations. It is safe to define `rem` as a no-op (`() => {}`) if the aggregate is never used in the context of a rolling window frame.

* *name*: The name to use for the aggregate function.
* *def*: An aggregate operator definition object:
  * *create*: A creation function that takes non-field parameter values as input and returns a new aggregate operator instance. An aggregate operator instance should have four methods: *init(state)* to initialize any operator state, *add(state, value)* to add a value to the aggregate, *rem(state, value)* to remove a value from the aggregate, and *value(state)* to retrieve the current operator output value. The *state* parameter is a normal object for tracking all state information for a shared set of input field values.
  * *param*: Two-element array containing the counts of input fields and additional parameters, respectively.
  * *req*: Names of aggregate operators required by this one.
  * *stream*: Names of operators required by this one for streaming operations (value removes), used during windowed aggregations.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added function is allowed to override an existing function with the same name.

*Examples*

```js
// add an aggregate function that computes a sum of squares
// the "rem" method is only needed for windowed aggregates
aq.addAggregateFunction('sumsq', {
  create: () => ({
    init:  state => state.sumsq = 0,
    add:  (state, value) => state.sumsq += value * value,
    rem:  (state, value) => state.sumsq -= value * value,
    value: state => state.sumsq
  }),
  param: [1, 0] // 1 field input, 0 extra parameters
});

aq.table({ x: [1, 2, 3] })
  .rollup({ ssq: op.sumsq('x') } // { ssq: [14] }
```


<hr/><a id="addWindowFunction" href="#addWindowFunction">#</a>
<em>aq</em>.<b>addWindowFunction</b>(<i>name</i>, <i>def</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a custom window function. Throws an error if a function with the same name is already registered and the override option is not specified. After registration, the operator will be accessible via the [`op`](#op) object.

* *name*: The name to use for the window function.
* *def*: A window operator definition object:
  * *create*: A creation function that takes non-field parameter values as input and returns a new window operator instance. A window operator instance should have two methods: *init(state)* to initialize any operator state, and *value(state, field)* to retrieve the current operator output value. The *state* parameter is a [window state](https://github.com/uwdata/arquero/blob/master/src/engine/window/window-state.js) instance that provides access to underlying values and the sliding window frame.
  * *param*: Two-element array containing the counts of input fields and additional parameters, respectively.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added function is allowed to override an existing function with the same name.

*Examples*

```js
// add a window function that outputs the minimum of a field value
// and the current sorted window index, plus an optional offset
aq.addWindowFunction('idxmin', {
  create: (offset = 0) => ({
    init: () => {}, // do nothing
    value: (w, f) => Math.min(w.value(w.index, f), w.index) + offset
  }),
  param: [1, 1] // 1 field input, 1 extra parameter
});

aq.table({ x: [4, 3, 2, 1] })
  .derive({ x: op.idxmin('x', 1) }) // { x: [1, 2, 3, 2] }
```

<br/>

## <a id="table-methods">Table Methods</a>

To add new table-level methods, including transformation verbs, simply assign new methods to the `ColumnTable` class prototype.

*Examples*

```js
import { ColumnTable, op } from 'arquero';

// add a sum verb, which returns a new table containing summed
// values (potentially grouped) for a given column name
Object.assign(
  ColumnTable.prototype,
  {
    sum(column, { as = 'sum' } = {}) {
      return this.rollup({ [as]: op.sum(column) });
    }
  }
);
```

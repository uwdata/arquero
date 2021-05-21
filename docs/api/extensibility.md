---
title: Extensibility \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

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

<br/>

## <a id="op-functions">Op Functions</a>

Add new functions for use in table expressions.

<hr/><a id="addFunction" href="#addFunction">#</a>
<em>aq</em>.<b>addFunction</b>([<i>name</i>,] <i>fn</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a function for use within table expressions. If only a single argument is provided, it will be assumed to be a function and the system will try to extract its name. Throws an error if a function with the same name is already registered and the override option is not specified, or if no name is provided and the input function is anonymous. After registration, the function will be accessible via the [`op`](#op) object.

Also see the [`map()` expression helper](/#map) for a lightweight alternative that allows access to functions defined in an enclosing scope.

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

Add new table-level methods or verbs. The [addTableMethod](#addTableMethod) function registers a new function as an instance method of tables only. The [addVerb](#addVerb) method registers a new transformation verb with both tables and serializable [queries](./#query).

<hr/><a id="addTableMethod" href="#addTableMethod">#</a>
<em>aq</em>.<b>addTableMethod</b>(<i>name</i>, <i>method</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a custom table method, adding a new method with the given *name* to all table instances. The provided *method* must take a table as its first argument, followed by any additional arguments.

This method throws an error if the *name* argument is not a legal string value.
To protect Arquero internals, the *name* can not start with an underscore (`_`) character. If a custom method with the same name is already registered, the override option must be specified to overwrite it. In no case may a built-in method be overridden.

* *name*: The name to use for the table method.
* *method*: A function implementing the table method. This function should accept a table as its first argument, followed by any additional arguments.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added method is allowed to override an existing method with the same name. Built-in table methods can **not** be overridden; this flag applies only to methods previously added using the extensibility API.

*Examples*

```js
// add a table method named size, returning an array of row and column counts
aq.addTableMethod('size', table => [table.numRows(), table.numCols()]);
aq.table({ a: [1,2,3], b: [4,5,6] }).size() // [3, 2]
```

<hr/><a id="addVerb" href="#addVerb">#</a>
<em>aq</em>.<b>addVerb</b>(<i>name</i>, <i>method</i>, <i>params</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a custom transformation verb with the given *name*, adding both a table method and serializable [query](./#query) support. The provided *method* must take a table as its first argument, followed by any additional arguments. The required *params* argument describes the parameters the verb accepts. If you wish to add a verb to tables but do not require query serialization support, use [addTableMethod](#addTableMethod).

This method throws an error if the *name* argument is not a legal string value.
To protect Arquero internals, the *name* can not start with an underscore (`_`) character. If a custom method with the same name is already registered, the override option must be specified to overwrite it. In no case may a built-in method be overridden.

* *name*: The name to use for the table method.
* *method*: A function implementing the table method. This function should accept a table as its first argument, followed by any additional arguments.
* *params*: An array of schema descriptions for the verb parameters. These descriptors are needed to support query serialization. Each descriptor is an object with *name* (string-valued parameter name) and *type* properties (string-valued parameter type, see below). If a parameter has type `"Options"`, the descriptor can include an additional object-valued *props* property to describe any non-literal values, for which the keys are property names and the values are parameter types.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added method is allowed to override an existing method with the same name. Built-in verbs can **not** be overridden; this flag applies only to methods previously added using the extensibility API.

*Parameter Types*. The supported parameter types are:

* `"Expr"`: A single table expression, such as the input to [`filter()`](verbs/#filter).
* `"ExprList"`: A list of column references or expressions, such as the input to [`groupby()`](verbs/#groupby).
* `"ExprNumber"`: A number literal or numeric table expression, such as the *weight* option of [`sample()`](verbs/#sample).
* `"ExprObject"`: An object containing a set of expressions, such as the input to [`rollup()`](verbs/#rollup).
* `"JoinKeys"`: Input join keys, as in [`join()`](verbs/#join).
* `"JoinValues"`: Output join values, as in [`join()`](verbs/#join).
* `"Options"`: An options object of key-value pairs. If any of the option values are column references or table expressions, the descriptor should include a *props* property with property names as keys and parameter types as values.
* `"OrderKeys"`: A list of ordering criteria, as in [`orderby`](verbs/#orderby).
* `"SelectionList"`: A set of columns to select and potentially rename, as in [`select`](verbs/#select).
* `"TableRef"`: A reference to an additional input table, as in [`join()`](verbs/#join).
* `"TableRefList"`: A list of one or more additional input tables, as in [`concat()`](verbs/#concat).

*Examples*

```js
// add a bootstrapped confidence interval verb that
// accepts an aggregate expression plus options
aq.addVerb(
  'bootstrap_ci',
  (table, expr, options = {}) => table
    .params({ frac: options.frac || 1000 })
    .sample((d, $) => op.round($.frac * op.count()), { replace: true })
    .derive({ id: (d, $) => op.row_number() % $.frac })
    .groupby('id')
    .rollup({ bs: expr })
    .rollup({
      lo: op.quantile('bs', options.lo || 0.025),
      hi: op.quantile('bs', options.hi || 0.975)
    }),
  [
    { name: 'expr', type: 'Expr' },
    { name: 'options', type: 'Options' }
  ]
);

// apply the new verb
aq.table({ x: [1, 2, 3, 4, 6, 8, 9, 10] })
  .bootstrap_ci(op.mean('x'))
```

<br/>

## <a id="packages">Package Bundles</a>

Extend Arquero with a bundle of functions, table methods, and/or verbs.

<hr/><a id="addPackage" href="#addPackage">#</a>
<em>aq</em>.<b>addPackage</b>(<i>bundle</i>[, <i>options</i>]) · [Source](https://github.com/uwdata/arquero/blob/master/src/register.js)

Register a *bundle* of extensions, which may include standard functions, aggregate functions, window functions, table methods, and verbs. If the input *bundle* has a key named `"arquero_package"`, the value of that property is used; otherwise the *bundle* object is used directly. This method is particularly useful for publishing separate packages of Arquero extensions and then installing them with a single method call.

A package bundle has the following structure:

```js
const bundle = {
  functions: { ... },
  aggregateFunctions: { ... },
  windowFunctions: { ... },
  tableMethods: { ... },
  verbs: { ... }
};
```

All keys are optional. For example, `functions` or `verbs` may be omitted. Each sub-bundle is an object of key-value pairs, where the key is the name of the function and the value is the function to add.

The lone exception is the `verbs` bundle, which instead uses an object format with *method* and *params* keys, corresponding to the *method* and *params* arguments of [addVerb](#addVerb):

```js
const bundle = {
  verbs: {
    name: {
      method: (table, expr) => { ... },
      params: [ { name: 'expr': type: 'Expr' } ]
    }
  }
};
```

The package method performs validation prior to adding any package content. The method will throw an error if any of the package items fail validation. See the [addFunction](#addFunction), [addAggregateFunction](#addAggregateFunction), [addWindowFunction](#windowFunction), [addTableMethod](#addTableMethod), and [addVerb](#addVerb) methods for specific validation criteria. The *options* argument can be used to specify if method overriding is permitted, as supported by each of the aforementioned methods.

* *bundle*: The package bundle of extensions.
* *options*: Function registration options.
  * *override*: Boolean flag (default `false`) indicating if the added method is allowed to override an existing method with the same name. Built-in table methods or verbs can **not** be overridden; for table methods and verbs this flag applies only to methods previously added using the extensibility API.

*Examples*

```js
// add a package
aq.addPackage({
  functions: {
    square: x => x * x,
  },
  tableMethods: {
    size: table => [table.numRows(), table.numCols()]
  }
});
```

```js
// add a package, ignores any content outside of "arquero_package"
aq.addPackage({
  arquero_package: {
    functions: {
      square: x => x * x,
    },
    tableMethods: {
      size: table => [table.numRows(), table.numCols()]
    }
  }
});
```

```js
// add a package from a separate library
aq.addPackage(require('arquero-arrow'));
```
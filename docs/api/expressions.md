---
title: Expressions \| Arquero API Reference
---
# Arquero API Reference <a href="https://uwdata.github.io/arquero"><img align="right" src="../assets/logo.svg" height="38"/></a>

[Top-Level](/arquero/api) | [Table](table) | [Verbs](verbs) | [Op Functions](op) | [**Expressions**](expressions) | [Extensibility](extensibility)

* [Table Expressions](#table)
  * [Limitations](#limitations)
  * [Column Shorthands](#column-shorthands)
  * [Aggregate &amp; Window Shorthands](#aggregate-window-shorthands)
* [Two-Table Expressions](#two-table)
  * [Column Shorthands](#two-table-column-shorthands)
* [Why are only `op` functions supported?](#why-op-functions-only)

<br/>

## <a id="table">Table Expressions</a>

Most Arquero [verbs](./verbs) accept *table expressions*: functions defined over table column values. For example, the `derive` verb creates new columns based on the provided expressions:

```js
table.derive({
  raise: d => op.pow(d.col1, d.col2),
  'col diff': d => d.col1 - d['base col']
})
```

In the example above, the two [arrow function expressions](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) are table expressions. The input argument `d` represents a row of the data table, whose properties are column names. Table expressions can include standard JavaScript expressions and invoke functions defined on the [`op` object](op), which, depending on the context, may include [standard](op#functions), [aggregate](op#aggregate-functions), or [window](op#window-functions) functions.

At first glance table expressions look like normal JavaScript functions... but hold on! Under the hood, Arquero takes a set of function definitions, maps them to strings, then parses, rewrites, and compiles them to efficiently manage data internally. From Arquero's point of view, the following examples are all equivalent:

1. `function(d) { return op.sqrt(d.value); }`
2. `d => op.sqrt(d.value)`
3. `({ value }) => op.sqrt(value)`
4. `d => sqrt(d.value)`
5. `d => aq.op.sqrt(d.value)`
6. `"d => op.sqrt(d.value)"`
7. `"sqrt(d.value)"`

Examples 1 through 5 are function definitions, while examples 6 and 7 are string literals. Let's walk through each:

* *Examples 1-3*: These are just different variants of writing standard JavaScript functions: traditional function definitions, arrow function definitions, and [destructured arguments](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment).
* *Examples 4-5*: While it is conventional to use the [`op` object](./op) to invoke functions, it is not required. For *any* function invocation, the function name will be looked up on the `op` object, even if the function is called directly (as in Example 4) or as the result of a nested property lookup (Example 5). Internally, Arquero's parser doesn't care if you call `sqrt()`, `op.sqrt()`, or `aq.op.sqrt()`; any will work. That said, using an explicit `op` object avoids errors and allows linting and auto-complete to proceed unimpeded.
* *Examples 6-7*: To parse table expressions, Arquero first maps input functions to source code strings. We can simply skip this step and pass a string directly, as in Example 6. For Example 7, the string contains an expression but not a function definition. In this case, an implicit function definition is assumed and the row identifier defaults to `d`; using an identifier other than `d` will fail. In contrast, with an explicit function definition you are free to rename the argument as you see fit.

### <a id="limitations">Limitations</a>

A number of JavaScript features are not allowed in table expressions, including internal function definitions, variable updates, and `for` loops. The *only* function calls allowed are those provided by the `op` object. ([Why? Read below for more...](#why-op-functions-only))

Most notably, **closures are not supported**. As a result, table expressions can not access variables defined in the enclosing scope. To define expression variables, use the [table `params` method](table#params) method to bind a parameter value to a table context. Parameters can then be accessed by including a second argument to a table expression; all bound parameters are available as properties of that argument (default name `$`):

```js
table
  .params({ threshold: 5 })
  .filter((d, $) => d.value < $.threshold)
```

Alternatively, for programmatic generation of table expressions one can fallback to a generating a string &ndash; rather than a proper function definition &ndash; and use that instead:

```js
// note: threshold must safely coerce to a string!
const threshold = 5;
table.filter(`d => d.value < ${threshold}`)
```

### <a id="column-shorthands">Column Shorthands</a>

Some verbs &ndash; including [`groupby()`](verbs#groupby), [`orderby()`](verbs#orderby), [`fold()`](verbs#fold), [`pivot()`](verbs#pivot), and [`join()`](verbs#join) &ndash; accept shorthands such as column name strings. Given a table with columns `colA` and `colB` (in that order), the following are equivalent:

1. `table.groupby('colA', 'colB')` - Refer to columns by name
2. `table.groupby(['colA', 'colB'])` - Use an explicit array of names
3. `table.groupby(0, 1)` - Refer to columns by index
4. `table.groupby(aq.range(0, 1))` - Use a column [range](index#range) helper
5. `table.groupby({ colA: d => d.colA, colB: d => d.colB })` - Explicit table expressions

Underneath the hood, ultimately all of these variants are grounded down to table expressions.

### <a id="aggregate-window-shorthands">Aggregate &amp; Window Shorthands</a>

For [aggregate](op#aggregate-functions) and [window](op#window-functions) functions, use of the `op` object outside of a table expression allows the use of shorthand references. The following examples are equivalent:

1. `d => op.mean(d.value)` - Standard table expression
2. `op.mean('value')` - Shorthand table expression generator

The second example produces an object that, when coerced to a string, generates `'d => op.mean(d["value"])'` as a result.

<br>

## <a id="two-table">Two-Table Expressions</a>

For [join](verbs#joins) verbs, Arquero also supports *two-table* table expressions. Two-table expressions have an expanded signature that accepts two rows as input, one from the "left" table and one from the "right" table.

```js
table.join(otherTable, (a, b) => op.equal(a.key, b.key))
```

The use of aggregate and window functions is not allowed within two-table expressions. Otherwise, two-table expressions have the same capabilities and limitations as normal (single-table) table expressions.

Bound parameters can be accessed by including a third argument:

```js
table
  .params({ threshold: 1.5 })
  .join(otherTable, (a, b, $) => op.abs(a.value - b.value) < $.threshold)
```

### <a id="two-table-column-shorthands">Two-Table Column Shorthands</a>

Rather than writing explicit two-table expressions, join verbs can also accept column shorthands in the form of a two-element array: the first element of the array is either a string or string array with columns in the first (left) table, whereas the second element indicates columns in the second (right) table.

Given two tables &ndash; one with columns `x`, `y` and the other with columns `u`, `v` &ndash; the following examples are equivalent:

1. `table.join(other, ['x', 'u'], [['x', 'y'], 'v'])`
2. `table.join(other, [['x'], ['u']], [['x', 'y'], ['v']])`
3. `table.join(other, ['x', 'u'], [aq.all(), aq.not('u')])`

All of which are in turn equivalent to using the following two-table expressions:

```js
table.join(other, ['x', 'u'], {
  x: (a, b) => a.x,
  y: (a, b) => a.y,
  v: (a, b) => b.v
})
```

## <a id="why-op-functions-only"></a>Why are only `op` functions supported?

Any function that is callable within an Arquero table expression must be defined on the `op` object, either as a built-in function or added via the [extensibility API](extensibility). Why? Why can't one just use a function directly?

As [described earlier](#table), Arquero table expressions can look like normal JavaScript functions, but are treated specially: their source code is parsed and new custom functions are generated to process data. This process prevents the use of [closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures), such as referencing functions or values defined externally to the expression.

But why do we do this? Here are a few reasons:

* **Performance**. After parsing an expression, Arquero performs code generation, often creating more performant code in the process. This level of indirection also allows us to generate optimized expressions for certain inputs, such as Apache Arrow data.

* **Flexibility**. Providing our own parsing also allows us to introduce new kinds of backing data without changing the API. For example, we could add support for different underlying data formats and storage layouts.

* **Portability**. While a common use case of Arquero is to query data directly in the same JavaScript runtime, Arquero verbs can also be [*serialized as queries*](./#queries): one can specify verbs in one environment, but then send them to another environment for processing. For example, the [arquero-worker](https://github.com/uwdata/arquero-worker) package sends queries to a worker thread, while the [arquero-sql](https://github.com/chanwutk/arquero-sql) package sends them to a backing database server. As custom methods may not be defined in those environments, Arquero is designed to make this translation between environments possible and easier to reason about.

* **Safety**. Arquero table expressions do not let you call methods defined on input data values. For example, to trim a string you must call `op.trim(str)`, not `str.trim()`. Again, this aids portability: otherwise unsupported methods defined on input data elements might "sneak" in to the processing. Invoking arbitrary methods may also lead to security vulnerabilities when allowing untrusted third parties to submit queries into a system.

* **Discoverability**. Defining all functions on a single object provides a single catalog of all available operations. In most IDEs, you can simply type `op.` (and perhaps hit the tab character) to the see a list of all available functions and benefit from auto-complete!

Of course, one might wish to make different trade-offs. Arquero is designed to support common use cases while also being applicable to more complex production setups. This goal comes with the cost of more rigid management of functions. That said, Arquero can be extended with custom variables, functions, and even new table methods or verbs! As starting points, see the [params](table#params), [addFunction](extensibility#addFunction), and [addTableMethod](extensibility#addTableMethod) functions to introduce external variables, register new `op` functions, or extend tables with new methods.

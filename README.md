# Arquero <a href="https://idl.uw.edu/arquero"><img align="right" src="https://raw.githubusercontent.com/uwdata/arquero/main/docs/assets/logo.svg" height="38"></img></a>

**Arquero** is a JavaScript library for query processing and transformation of array-backed data tables. Following the [relational algebra](https://en.wikipedia.org/wiki/Relational_algebra) and inspired by the design of [dplyr](https://dplyr.tidyverse.org/), Arquero provides a fluent API for manipulating column-oriented data frames. Arquero supports a range of data transformation tasks, including filter, sample, aggregation, window, join, and reshaping operations.

* Fast: process data tables with million+ rows.
* Flexible: query over arrays, typed arrays, array-like objects, or [Apache Arrow](https://arrow.apache.org/) columns.
* Full-Featured: perform a variety of wrangling and analysis tasks.
* Extensible: add new column types or functions, including aggregate &amp; window operations.
* Lightweight: small size, minimal dependencies.

To get up and running, start with the [Introducing Arquero](https://observablehq.com/@uwdata/introducing-arquero) tutorial, part of the [Arquero notebook collection](https://observablehq.com/collection/@uwdata/arquero).

Have a question or need help? Visit the [Arquero GitHub repo](https://github.com/uwdata/arquero) or post to the [Arquero GitHub Discussions board](https://github.com/uwdata/arquero/discussions).

Arquero is Spanish for "archer": if datasets are [arrows](https://arrow.apache.org/), Arquero helps their aim stay true. 🏹 Arquero also refers to a goalkeeper: safeguard your data from analytic "own goals"! 🥅 ✋ ⚽

## API Documentation

* [Top-Level API](https://idl.uw.edu/arquero/api) - All methods in the top-level Arquero namespace.
* [Table](https://idl.uw.edu/arquero/api/table) - Table access and output methods.
* [Verbs](https://idl.uw.edu/arquero/api/verbs) - Table transformation verbs.
* [Op Functions](https://idl.uw.edu/arquero/api/op) - All functions, including aggregate and window functions.
* [Expressions](https://idl.uw.edu/arquero/api/expressions) - Parsing and generation of table expressions.
* [Extensibility](https://idl.uw.edu/arquero/api/extensibility) - Extend Arquero with new expression functions or table verbs.

## Example

The core abstractions in Arquero are *data tables*, which model each column as an array of values, and *verbs* that transform data and return new tables. Verbs are table methods, allowing method chaining for multi-step transformations. Though each table is unique, many verbs reuse the underlying columns to limit duplication.

```js
import { all, desc, op, table } from 'arquero';

// Average hours of sunshine per month, from https://usclimatedata.com/.
const dt = table({
  'Seattle': [69,108,178,207,253,268,312,281,221,142,72,52],
  'Chicago': [135,136,187,215,281,311,318,283,226,193,113,106],
  'San Francisco': [165,182,251,281,314,330,300,272,267,243,189,156]
});

// Sorted differences between Seattle and Chicago.
// Table expressions use arrow function syntax.
dt.derive({
    month: d => op.row_number(),
    diff:  d => d.Seattle - d.Chicago
  })
  .select('month', 'diff')
  .orderby(desc('diff'))
  .print();

// Is Seattle more correlated with San Francisco or Chicago?
// Operations accept column name strings outside a function context.
dt.rollup({
    corr_sf:  op.corr('Seattle', 'San Francisco'),
    corr_chi: op.corr('Seattle', 'Chicago')
  })
  .print();

// Aggregate statistics per city, as output objects.
// Reshape (fold) the data to a two column layout: city, sun.
dt.fold(all(), { as: ['city', 'sun'] })
  .groupby('city')
  .rollup({
    min:  d => op.min(d.sun), // functional form of op.min('sun')
    max:  d => op.max(d.sun),
    avg:  d => op.average(d.sun),
    med:  d => op.median(d.sun),
    // functional forms permit flexible table expressions
    skew: ({sun: s}) => (op.mean(s) - op.median(s)) / op.stdev(s) || 0
  })
  .objects()
```

## Usage

### In Browser

To use in the browser, you can load Arquero from a content delivery network:

```html
<script src="https://cdn.jsdelivr.net/npm/arquero@latest"></script>
```

Arquero will be imported into the `aq` global object. The default browser bundle does not include the [Apache Arrow](https://arrow.apache.org/) library. To perform Arrow encoding using [toArrow()](https://idl.uw.edu/arquero/api/#toArrow) or binary file loading using [loadArrow()](https://idl.uw.edu/arquero/api/#loadArrow), import Apache Arrow first:

```html
<script src="https://cdn.jsdelivr.net/npm/apache-arrow@latest"></script>
<script src="https://cdn.jsdelivr.net/npm/arquero@latest"></script>
```

Alternatively, you can build and import `arquero.min.js` from the `dist` directory, or build your own application bundle. When building custom application bundles for the browser, the module bundler should draw from the `browser` property of Arquero's `package.json` file. For example, if using [rollup](https://rollupjs.org/), pass the `browser: true` option to the [node-resolve](https://github.com/rollup/plugins/tree/master/packages/node-resolve) plugin.

Arquero uses modern JavaScript features, and so will not work with some outdated browsers. To use Arquero with older browsers including Internet Explorer, set up your project with a transpiler such as [Babel](https://babeljs.io/).

### In Node.js or Application Bundles

First install `arquero` as a dependency, for example via `npm install arquero --save`.
Arquero assumes Node version 18 or higher.
As of Arquero version 6, the library uses type `module` and should be loaded using ES module syntax.

Import using ES module syntax, import all exports into a single object:

```js
import * as aq from 'arquero';
```

Import using ES module syntax, with targeted imports:

```js
import { op, table } from 'arquero';
```

Dynamic import (e.g., within a Node.js REPL):

```js
aq = await import('arquero');
```

## Build Instructions

To build and develop Arquero locally:

- Clone [https://github.com/uwdata/arquero](https://github.com/uwdata/arquero).
- Run `npm i` to install dependencies.
- Run `npm test` to run test cases, `npm run perf` to run performance benchmarks, and `npm run build` to build output files.

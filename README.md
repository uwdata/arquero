# Arquero

**Arquero** is a JavaScript library for query processing and transformation of array-oriented data tables. Following the [relational algebra](https://en.wikipedia.org/wiki/Relational_algebra) and inspired by the design of [dplyr](https://dplyr.tidyverse.org/), Arquero provides a fluent API for manipulating column-oriented data frames. Arquero supports a range of data transformation tasks, including filter, sample, aggregation, window, join, and reshaping operations.

Arquero means "archer" in Spanish: if datasets are [arrows](https://arrow.apache.org/), Arquero helps their aim stay true.

```js
import { table, op } from 'arquero';

const dt = table({
  k: ['a', 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b'],
  x: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  y: [1, 2, 3, 4, 5, 6, 7, 8, 9]
});

dt.filter(d => d.x > 2)
  .groupby('k')
  .derive({
    xy: d => d.x * d.y
  })
  .rollup({
    mu_xy: d => op.mean(d.xy),
    sd_xy: d => op.stdev(d.xy),
    corr: d => op.corr(d.x, d.y)
  })
```
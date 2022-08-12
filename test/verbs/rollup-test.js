/* eslint-disable no-undef */
import tape from 'tape';
import tableEqual from '../table-equal';
import { bin, op, table } from '../../src';

tape('rollup produces flat aggregates', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const rt = table(data).rollup({ sum: d => op.sum(d.a + d.b) });

  t.equal(rt.numRows(), 1, 'num rows');
  t.equal(rt.numCols(), 1, 'num cols');
  tableEqual(t, rt, { sum: [36] }, 'rollup data');
  t.end();
});

tape('rollup produces grouped aggregates', t => {
  const data = {
    k: ['a', 'a', 'b', 'b'],
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const rt = table(data)
    .groupby({ key: d => d.k })
    .rollup({ sum: d => op.sum(d.a + d.b) });

  t.equal(rt.numRows(), 2, 'num rows');
  t.equal(rt.numCols(), 2, 'num cols');
  tableEqual(t, rt, {
    key: ['a', 'b'],
    sum: [10, 26]
  }, 'rollup data');
  t.end();
});

tape('rollup handles empty tables', t => {
  [[], [null, null], [undefined, undefined], [NaN, NaN]].forEach(v => {
    const rt = table({ v }).rollup({
      sum:  op.sum('v'),
      prod: op.product('v'),
      mode: op.mode('v'),
      med:  op.median('v'),
      min:  op.min('v'),
      max:  op.min('v'),
      sd:   op.stdev('v')
    });

    tableEqual(t, rt, {
      sum:  [undefined],
      prod: [undefined],
      mode: [undefined],
      med:  [undefined],
      min:  [undefined],
      max:  [undefined],
      sd:   [undefined]
    }, 'rollup data, ' + (v.length ? v[0] : 'empty'));
  });

  t.end();
});

tape('rollup handles empty input', t => {
  const dt = table({ x: ['a', 'b', 'c'] });

  tableEqual(t, dt.rollup(), { }, 'rollup data, no groups');

  tableEqual(t,
    dt.groupby('x').rollup(),
    { x: ['a', 'b', 'c'] },
    'rollup data, groups'
  );

  t.end();
});

tape('rollup supports bigint values', t => {
  const data = {
    v: [1n, 2n, 3n, 4n, 5n]
  };

  const dt = table(data)
    .rollup({
      any:  op.any('v'),
      dist: op.distinct('v'),
      cnt:  op.count('v'),
      val:  op.valid('v'),
      inv:  op.invalid('v'),
      sum:  op.sum('v'),
      prod: op.product('v'),
      min:  op.min('v'),
      max:  op.max('v'),
      med:  op.median('v'),
      vals: op.array_agg('v'),
      uniq: op.array_agg_distinct('v')
    });

  t.deepEqual(
    dt.objects()[0],
    {
      any: 1n,
      dist: 5,
      cnt: 5,
      val: 5,
      inv: 0,
      sum: 15n,
      prod: 120n,
      min: 1n,
      max: 5n,
      med: 3n,
      vals: [1n, 2n, 3n, 4n, 5n],
      uniq: [1n, 2n, 3n, 4n, 5n]
    },
    'rollup data'
  );
  t.end();
});

tape('rollup supports ordered tables', t => {
  const rt = table({ v: [3, 1, 4, 2] })
    .orderby('v')
    .rollup({ v: op.array_agg('v') });

  tableEqual(t, rt, { v: [ [1, 2, 3, 4] ] }, 'rollup data');
  t.end();
});

tape('rollup supports object_agg functions', t => {
  const data = {
    g: [0, 0, 1, 1, 1],
    k: ['a', 'b', 'a', 'b', 'a'],
    v: [1, 2, 3, 4, 5]
  };

  const dt = table(data).groupby('g');

  t.deepEqual(
    dt.rollup({ o: op.object_agg('k', 'v') })
      .columnArray('o'),
    [
      { a: 1, b: 2 },
      { a: 5, b: 4 }
    ],
    'rollup data - object_agg'
  );

  t.deepEqual(
    dt.rollup({ o: op.entries_agg('k', 'v') })
      .columnArray('o'),
    [
      [['a', 1], ['b', 2]],
      [['a', 3], ['b', 4], ['a', 5]]
    ],
    'rollup data - entries_agg'
  );

  t.deepEqual(
    dt.rollup({ o: op.map_agg('k', 'v') })
      .columnArray('o'),
    [
      new Map([['a', 1], ['b', 2]]),
      new Map([['a', 5], ['b', 4]])
    ],
    'rollup data - map_agg'
  );

  t.end();
});

tape('rollup supports histogram', t => {
  const data = { x: [1, 1, 3, 4, 5, 6, 7, 8, 9, 10] };
  const result = {
    b0: [1, 3, 4, 5, 6, 7, 8, 9, 10],
    b1: [1.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5],
    count: [2, 1, 1, 1, 1, 1, 1, 1, 1]
  };

  const dt = table(data)
    .groupby({
      b0: d => bin(d.x, ...bins(d.x, 20)),
      b1: d => bin(d.x, ...bins(d.x, 20), 1)
    })
    .count();
  tableEqual(t,  dt, result, 'histogram');

  const ht = table(data)
    .groupby({
      b0: bin('x', { maxbins: 20 }),
      b1: bin('x', { maxbins: 20, offset: 1 })
    })
    .count();
  tableEqual(t,  ht, result, 'histogram from bin helper, maxbins');

  const st = table(data)
    .groupby({
      b0: bin('x', { step: 0.5 }),
      b1: bin('x', { step: 0.5, offset: 1 })
    })
    .count();
  tableEqual(t,  st, result, 'histogram from bin helper, step');

  t.end();
});

tape('rollup supports dot product', t => {
  const data = { x: [1, 2, 3], y: [4, 5, 6] };
  const dt = table(data).rollup({ dot: d => sum(d.x * d.y) });
  tableEqual(t, dt, { dot: [32] }, 'dot product');
  t.end();
});

tape('rollup supports geometric mean', t => {
  const data = { x: [1, 2, 3, 4, 5, 6] };
  const dt = table(data).rollup({ gm: d => exp(mean(log(d.x))) });
  const gm = [ Math.pow(1 * 2 * 3 * 4 * 5 * 6, 1/6) ];
  tableEqual(t, dt, { gm }, 'geometric mean');
  t.end();
});

tape('rollup supports harmonic mean', t => {
  const data = { x: [1, 2, 3, 4, 5, 6] };
  const dt = table(data).rollup({ hm: d => 1 / mean(1 / d.x) });
  const hm = [ 6 / (1 + 1/2 + 1/3 + 1/4 + 1/5 + 1/6) ];
  tableEqual(t, dt, { hm }, 'harmonic mean');
  t.end();
});

tape('rollup supports median skew', t => {
  const data = { x: [1, 2, 3, 4, 5, 1000] };
  const dt = table(data).rollup({
    ms: ({ x }) => stdev(x) ? (mean(x) - median(x)) / stdev(x) : 0
  });
  tableEqual(t, dt, { ms: [ 0.4070174034861516 ] }, 'median skew');
  t.end();
});

tape('rollup supports vector norm', t => {
  const data = { x: [1, 2, 3, 4, 5] };
  const dt = table(data).rollup({ vn: d => sqrt(sum(d.x * d.x)) });
  const vn = [ Math.sqrt(1 + 4 + 9 + 16 + 25) ];
  tableEqual(t, dt, { vn }, 'vector norm');
  t.end();
});

tape('rollup supports cohens d', t => {
  const data = {
    a: [3, 4, 5, 6, 7],
    b: [1, 2, 3, 4, 5]
  };
  const dt = table(data).rollup({
    cd: ({ a, b }) => {
      const va = (valid(a) - 1) * variance(a);
      const vb = (valid(b) - 1) * variance(b);
      const sd = sqrt((va + vb) / (valid(a) + valid(b) - 2));
      return sd ? (mean(a) - mean(b)) / sd : 0;
    }
  });
  tableEqual(t, dt, { cd: [ 1.2649110640673518 ] }, 'cohens d');
  t.end();
});

tape('rollup supports entropy', t => {
  const data = { x: [1, 1, 1, 2, 2, 3] };
  const dt = table(data)
    .groupby('x')
    .count({ as: 'num' })
    .derive({ p: d => d.num / sum(d.num) })
    .rollup({ h: d => -sum(d.p ? d.p * log2(d.p) : 0) });
  tableEqual(t, dt, { h: [ 1.4591479170272448 ] }, 'entropy');
  t.end();
});

tape('rollup supports spearman rank correlation', t => {
  const data = {
    a: [1, 2, 2, 3, 4, 5],
    b: [9, 8, 8, 7, 6, 5]
  };

  const dt = table(data)
    .orderby('a').derive({ ra: () => avg_rank() })
    .orderby('b').derive({ rb: () => avg_rank() })
    .rollup({ rho: d => corr(d.ra, d.rb) });

  tableEqual(t, dt, { rho: [ -1 ]}, 'spearman rank correlation');
  t.end();
});

tape('rollup errors when parsing window functions', t => {
  t.throws(() =>
    table({ a: [1, 2, 2, 3, 4, 5] })
      .rollup({ x: d => op.first_value(d.a) })
  );
  t.end();
});
const tape = require('tape');
const { floats, sample, strings } = require('./data-gen');
const { table, op } = require('..');

function time(fn, ...args) {
  const t0 = Date.now();
  fn(...args);
  return Date.now() - t0;
}

function run(N, nulls, msg) {
  const dt = table({
    k: sample(N, strings(10), nulls),
    a: floats(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls),
    c: floats(N, -10000, 10000, nulls)
  });

  const gt = dt.groupby('k');
  const sum1 = { a: op.sum('a') };
  const sum2 = { a: op.sum('a'), b: op.sum('b') };
  const sum3 = { a: op.sum('a'), b: op.sum('b'), c: op.sum('c') };

  const avg1 = { a: op.mean('a') };
  const avg2 = { a: op.mean('a'), b: op.mean('b') };
  const avg3 = { a: op.mean('a'), b: op.mean('b'), c: op.mean('c') };

  tape(`rollup: ${msg}`, t => {
    console.table([ // eslint-disable-line
      {
        op: 'sum',
        'flat-1':   time(() => dt.rollup(sum1)),
        'flat-2':   time(() => dt.rollup(sum2)),
        'flat-3':   time(() => dt.rollup(sum3)),
        'group-1':  time(() => dt.rollup(sum1)),
        'group-2':  time(() => dt.rollup(sum2)),
        'group-3':  time(() => dt.rollup(sum3))
      },
      {
        op: 'avg',
        'flat-1':   time(() => dt.rollup(avg1)),
        'flat-2':   time(() => dt.rollup(avg2)),
        'flat-3':   time(() => dt.rollup(avg3)),
        'group-1':  time(() => dt.rollup(avg1)),
        'group-2':  time(() => dt.rollup(avg2)),
        'group-3':  time(() => dt.rollup(avg3))
      },
      {
        op: 'count',
        'flat-1':   time(() => dt.count()),
        'group-1':  time(() => gt.count())
      }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');
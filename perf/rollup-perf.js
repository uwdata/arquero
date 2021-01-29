const tape = require('tape');
const time = require('./time');
const { floats, sample, strings } = require('./data-gen');
const { table, op } = require('..');

function run(N, nulls, msg) {
  const dt = table({
    k: sample(N, strings(10), nulls),
    a: floats(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls),
    c: floats(N, -10000, 10000, nulls)
  });

  const g = time(() => dt.groupby('k'));
  const gt = dt.groupby('k');
  const sum1 = { a: op.sum('a') };
  const sum2 = { a: op.sum('a'), b: op.sum('b') };
  const sum3 = { a: op.sum('a'), b: op.sum('b'), c: op.sum('c') };

  const avg1 = { a: op.mean('a') };
  const avg2 = { a: op.mean('a'), b: op.mean('b') };
  const avg3 = { a: op.mean('a'), b: op.mean('b'), c: op.mean('c') };

  tape(`rollup: ${msg}`, t => {
    const fc = time(() => dt.count());
    const gc = time(() => gt.count());
    console.table([ // eslint-disable-line
      {
        op: 'group',
        'flat-1':   0,
        'flat-2':   0,
        'flat-3':   0,
        'group-1':  g,
        'group-2':  g,
        'group-3':  g
      },
      {
        op: 'count',
        'flat-1':   fc,
        'flat-2':   fc,
        'flat-3':   fc,
        'group-1':  gc,
        'group-2':  gc,
        'group-3':  gc
      },
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
      }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');
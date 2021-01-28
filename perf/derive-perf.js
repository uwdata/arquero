const tape = require('tape');
const time = require('./time');
const { floats, sample, strings } = require('./data-gen');
const { table } = require('..');

function run(N, nulls, msg) {
  const dt = table({
    k: sample(N, strings(10), nulls),
    c: sample(N, strings(100), nulls),
    a: floats(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls)
  });

  const gt = dt.groupby('k');
  const sum2 = { s: 'd.a + d.b' };
  const fill = { p: 'fill_down(d.c)' };
  const zscr = { z: '(d.a - mean(d.a)) / stdev(d.a) || 0' };

  tape(`derive: ${msg}`, t => {
    console.table([ // eslint-disable-line
      {
        op:   'sum2',
        flat:  time(() => dt.derive(sum2)),
        group: time(() => gt.derive(sum2))
      },
      {
        op:   'fill',
        flat:  time(() => dt.derive(fill)),
        group: time(() => gt.derive(fill))
      },
      {
        op:   'zscore',
        flat:  time(() => dt.derive(zscr)),
        group: time(() => gt.derive(zscr))
      }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');
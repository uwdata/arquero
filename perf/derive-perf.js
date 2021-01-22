const tape = require('tape');
const { floats, sample, strings } = require('./data-gen');
const { table } = require('..');

function time(fn, ...args) {
  const t0 = Date.now();
  fn(...args);
  return Date.now() - t0;
}

function run(N, nulls, msg) {
  const dt = table({
    k: sample(N, strings(10), nulls),
    c: sample(N, strings(100), nulls),
    a: floats(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls)
  });

  const gt = dt.groupby('k');
  const sum = { s: 'd.a + d.b' };
  const pdf = { p: 'distinct(d.c) / count()'};
  const zsc = { z: '(d.a - mean(d.a)) / stdev(d.a) || 0' };

  tape(`derive: ${msg}`, t => {
    console.table([ // eslint-disable-line
      {
        op:   'sum',
        flat:  time(() => dt.derive(sum)),
        group: time(() => gt.derive(sum))
      },
      {
        op:   'zscore',
        flat:  time(() => dt.derive(zsc)),
        group: time(() => gt.derive(zsc))
      },
      {
        op:   'prob',
        flat:  time(() => dt.derive(pdf)),
        group: time(() => gt.derive(pdf))
      }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');
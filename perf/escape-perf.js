const tape = require('tape');
const time = require('./time');
const { floats, sample, strings } = require('./data-gen');
const aq = require('..');

function run(N, nulls, msg) {
  const off = 1;
  const dt = aq.table({
    k: sample(N, strings(10), nulls),
    c: sample(N, strings(100), nulls),
    a: floats(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls)
  }).params({ off });

  const opt = { s: 'd.a * d.b + off' };
  const esc = { s: aq.escape(d => d.a * d.b + off) };

  tape(`escape: ${msg}`, t => {
    console.table([ // eslint-disable-line
      { type: 'opt', flat: time(() => dt.derive(opt)) },
      { type: 'esc', flat: time(() => dt.derive(esc)) }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');
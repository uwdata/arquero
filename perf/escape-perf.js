import tape from 'tape';
import { time } from './time.js';
import { floats, sample, strings } from './data-gen.js';
import * as aq from '../src/index.js';

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

  tape(`escape: ${msg}`, async t => {
    console.table([ // eslint-disable-line
      { type: 'opt', flat: await time(() => dt.derive(opt)) },
      { type: 'esc', flat: await time(() => dt.derive(esc)) }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');

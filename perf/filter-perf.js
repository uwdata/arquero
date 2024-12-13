import tape from 'tape';
import { time } from './time.js';
import { floats, ints, sample, strings } from './data-gen.js';
import { table } from '../src/index.js';

function run(N, nulls, msg) {
  const dt = table({
    a: ints(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls),
    c: sample(N, strings(2), nulls)
  });

  const str = dt.get('c', 0);

  tape(`filter: ${msg}`, async t => {
    console.table([ // eslint-disable-line
      {
        type:  'integer',
        table:  await time(() => dt.filter('d.a > 0')),
        reify:  await time(() => dt.filter('d.a > 0').reify()),
        object: await time(a => a.filter(d => d.a > 0), dt.objects()),
        array:  await time(a => a.filter(v => v > 0), dt.column('a'))
      },
      {
        type:  'float',
        table:  await time(() => dt.filter('d.b > 0')),
        reify:  await time(() => dt.filter('d.b > 0').reify()),
        object: await time(a => a.filter(d => d.b > 0), dt.objects()),
        array:  await time(a => a.filter(v => v > 0), dt.column('b'))
      },
      {
        type:  'string',
        table:  await time(() => dt.filter(`d.c === '${str}'`)),
        reify:  await time(() => dt.filter(`d.c === '${str}'`).reify()),
        object: await time(a => a.filter(d => d.c === str), dt.objects()),
        array:  await time(a => a.filter(v => v === str), dt.column('c'))
      }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');

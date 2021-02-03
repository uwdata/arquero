const tape = require('tape');
const time = require('./time');
const { floats, ints, sample, strings } = require('./data-gen');
const { table } = require('..');

function run(N, nulls, msg) {
  const dt = table({
    a: ints(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls),
    c: sample(N, strings(2), nulls)
  });

  const str = dt.get('c', 0);

  tape(`filter: ${msg}`, t => {
    console.table([ // eslint-disable-line
      {
        type:  'integer',
        table:  time(() => dt.filter('d.a > 0')),
        reify:  time(() => dt.filter('d.a > 0').reify()),
        object: time(a => a.filter(d => d.a > 0), dt.objects()),
        array:  time(a => a.filter(v => v > 0), dt.column('a').data)
      },
      {
        type:  'float',
        table:  time(() => dt.filter('d.b > 0')),
        reify:  time(() => dt.filter('d.b > 0').reify()),
        object: time(a => a.filter(d => d.b > 0), dt.objects()),
        array:  time(a => a.filter(v => v > 0), dt.column('b').data)
      },
      {
        type:  'string',
        table:  time(() => dt.filter(`d.c === '${str}'`)),
        reify:  time(() => dt.filter(`d.c === '${str}'`).reify()),
        object: time(a => a.filter(d => d.c === str), dt.objects()),
        array:  time(a => a.filter(v => v === str), dt.column('c').data)
      }
    ]);
    t.end();
  });
}

run(1e6, 0, '1M values');
run(1e6, 0.05, '1M values, 5% nulls');
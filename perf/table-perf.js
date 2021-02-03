const tape = require('tape');
const time = require('./time');
const { floats, ints, sample, strings } = require('./data-gen');
const { from, table } = require('..');

function run(N, nulls, msg) {
  const dt = table({
    a: ints(N, -10000, 10000, nulls),
    b: floats(N, -10000, 10000, nulls),
    c: sample(N, strings(2), nulls),
    d: sample(N, strings(50), nulls),
    e: sample(N, strings(100), nulls)
  });

  const array = dt.objects();
  const iterable = {
    [Symbol.iterator]: () => array[Symbol.iterator]()
  };

  tape(`object serialization: ${msg}`, t => {
    console.table([ // eslint-disable-line
      {
        from_array:    time(() => from(array)),
        from_iterable: time(() => from(iterable)),
        to_objects:    time(() => dt.objects()),
        to_iterable:   time(() => [...dt])
      }
    ]);
    t.end();
  });
}

run(1e5, 0, '100k values');
run(1e5, 0.05, '100k values, 5% nulls');
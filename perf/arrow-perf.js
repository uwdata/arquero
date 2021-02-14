const tape = require('tape');
const time = require('./time');
const { bools, floats, ints, sample, strings } = require('./data-gen');
const { fromArrow, table } = require('..');
const {
  Bool, Dictionary, Float64, Int32, Table, Uint32, Utf8, Vector, predicate
} = require('apache-arrow');

function process(N, nulls, msg) {
  const vectors = [
    Vector.from({
      type: new Dictionary(new Utf8(), new Int32()),
      values: sample(N, strings(100), nulls),
      highWaterMark: 1e12
    }),
    Vector.from({
      type: new Int32(),
      values: ints(N, -10000, 10000, nulls),
      highWaterMark: 1e12
    })
  ];
  const at = Table.new(vectors, ['k', 'v']);
  const dt = fromArrow(at);

  const arrowFilterDict = val => time(() => {
    const p = new predicate.Equals(
      new predicate.Col('k'),
      new predicate.Literal(val)
    );
    at.filter(p).count();
  });

  const arqueroFilterDict = val => time(() => {
    dt.filter(`d.k === '${val}'`).numRows();
  });

  const arrowFilterValue = val => time(() => {
    const p = new predicate.GTeq(
      new predicate.Col('v'),
      new predicate.Literal(val)
    );
    at.filter(p).count();
  });

  const arqueroFilterValue = val => time(() => {
    dt.filter(`d.v >= ${val}`).numRows();
  });

  tape(`arrow processing: ${msg}`, t => {
    const k = at.getColumn('k').get(50);
    console.table([ // eslint-disable-line
      {
        operation: 'init table',
        'arrow-js': time(() => Table.new(vectors, ['k', 'v'])),
        arquero:    time(() => fromArrow(at))
      },
      {
        operation: 'count dictionary',
        'arrow-js': time(() => at.countBy('k')),
        arquero:    time(() => dt.groupby('k').count())
      },
      {
        operation: 'filter dictionary',
        'arrow-js': arrowFilterDict(k),
        arquero:    arqueroFilterDict(k)
      },
      {
        operation: 'filter numbers 0',
        'arrow-js': arrowFilterValue(0),
        arquero:    arqueroFilterValue(0)
      },
      {
        operation: 'filter numbers 1',
        'arrow-js': arrowFilterValue(1),
        arquero:    arqueroFilterValue(1)
      }
    ]);
    t.end();
  });
}

function serialize(N, nulls, msg) {
  tape(`arrow serialization: ${msg}`, t => {
    console.table([ // eslint-disable-line
      encode('boolean', new Bool(), bools(N, nulls)),
      encode('integer', new Int32(), ints(N, -10000, 10000, nulls)),
      encode('float', new Float64(), floats(N, -10000, 10000, nulls)),
      encode('dictionary',
        new Dictionary(new Utf8(), new Uint32(), 0),
        sample(N, strings(100), nulls)
      )
    ]);
    t.end();
  });
}

function encode(name, type, values) {
  const dt = table({ values });

  // measure encoding times
  const qt = time(() => dt.toArrow({ types: { values: type } }).serialize());
  const at = time(() => Table.new(
      [Vector.from({ type, values, highWaterMark: 1e12 })],
      ['values']
    ).serialize());
  const jt = time(() => JSON.stringify(values));

  // measure serialized byte size
  const ab = Table.new(
    [Vector.from({ type, values, highWaterMark: 1e12 })],
    ['values']
  ).serialize().length;
  const qb = dt.toArrow({ types: { values: type }}).serialize().length;
  const jb = (new TextEncoder().encode(JSON.stringify(values))).length;

  // check that arrow and arquero produce the same result
  if (qb !== ab) {
    // eslint-disable-next-line
    console.warn(`Arrow and Arquero bytes don't match: ${ab} vs. ${qb}`);
  }

  return {
    'data type':  name,
    'arrow-js':   at,
    'arquero':    qt,
    'json':       jt,
    'size-arrow': ab,
    'size-json':  jb
  };
}

// run arrow processing benchmarks
process(5e6, 0, '5M values, 0% nulls');
process(5e6, 0.05, '5M values, 5% nulls');

// run arrow serialization benchmarks
serialize(1e6, 0, '1M values');
serialize(1e6, 0.05, '1M values, 5% nulls');
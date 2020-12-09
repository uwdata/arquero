import tape from 'tape';
import tableEqual from '../table-equal';
import { op, rolling, table } from '../../src/verbs';
const { abs, lag, mean, median, rank, stdev } = op;

tape('derive creates new columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const dt = table(data).derive({ c: d => d.a + d.b });
  t.equal(dt.numRows(), 4, 'num rows');
  t.equal(dt.numCols(), 3, 'num cols');
  tableEqual(t, dt, { ...data, c: [3, 7, 11, 15] }, 'derive data');
  t.end();
});

tape('derive overwrites existing columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const dt = table(data).derive({ a: d => d.a + d.b });
  t.equal(dt.numRows(), 4, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, { ...data, a: [3, 7, 11, 15] }, 'derive data');
  t.end();
});

tape('derive can relocate new columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const t1 = table(data).derive({ z: d => d.a + d.b }, { before: 'a' });

  tableEqual(t,
    t1,
    { z: [3, 7, 11, 15], ...data },
    'derive data, with before'
  );

  t.deepEqual(
    t1.columnNames(),
    ['z', 'a', 'b'],
    'derive data columns, with before'
  );

  const t2 = table(data).derive({ z: d => d.a + d.b }, { after: 'a' });

  tableEqual(t,
    t2,
    { a: data.a, z: [3, 7, 11, 15], b: data.b },
    'derive data, with after'
  );

  t.deepEqual(
    t2.columnNames(),
    ['a', 'z', 'b'],
    'derive data columns, with after'
  );

  const t3 = table(data).derive({ a: d => -d.a, z: d => d.a + d.b }, { after: 'b' });

  tableEqual(t,
    t3,
    { a: [-1, -3, -5, -7], b: data.b, z: [3, 7, 11, 15] },
    'derive data, with after and overwrite'
  );

  t.deepEqual(
    t3.columnNames(),
    ['a', 'b', 'z'],
    'derive data columns, with after and overwrite'
  );

  t.end();
});

tape('derive supports aggregate and window operators', t => {
  const n = 10;
  const k = Array(n);
  const a = Array(n);
  const b = Array(n);

  for (let i = 0; i < n; ++i) {
    k[i] = i % 3;
    a[i] = i;
    b[i] = i + 1;
  }

  const td = table({ k, a, b })
    .groupby('k')
    .orderby('a')
    .derive({
      rank: () => rank(),
      diff: ({ a, b }) => a - lag(b, 1, 0),
      roll: rolling(d => mean(d.a), [-2, 0])
    });
  tableEqual(t, td.select('rank', 'diff', 'roll'), {
    rank: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4],
    diff: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    roll: [0, 1, 2, 1.5, 2.5, 3.5, 3, 4, 5, 6]
  }, 'derive window queries');

  const tz = td
    .ungroup()
    .derive({
      z: ({ a }) => abs(a - mean(a)) / stdev(a)
    });
  tableEqual(t, tz.select('z'), {
    z: [
      1.4863010829205867,
      1.1560119533826787,
      0.8257228238447705,
      0.49543369430686224,
      0.1651445647689541,
      0.1651445647689541,
      0.49543369430686224,
      0.8257228238447705,
      1.1560119533826787,
      1.4863010829205867
    ]
  }, 'z-score');

  const tm = tz
    .derive({ dev: d => abs(d.a - median(d.a)) })
    .rollup({ mad: d => median(d.dev) });
  tableEqual(t, tm.select('mad'), {
    mad: [ 2.5 ]
  }, 'mad');

  t.end();
});

tape('derive supports parameters', t => {
  const output = {
    n: [1, 2, 3, 4],
    p: [NaN, 1, 1, 1 ]
  };

  const dt = table({ n: [1, 2, 3, 4] }).params({lag: 1});

  tableEqual(t,
    dt.derive({p: (d, $) => d.n * $.lag - op.lag(d.n, 1)}),
    output,
    'parameter in main scope'
  );

  tableEqual(t,
    dt.derive({p: (d, $) => d.n - op.lag(d.n, $.lag)}),
    output,
    'parameter in operator input scope'
  );

  tableEqual(t,
    dt.derive({p: 'd.n * $.lag - op.lag(d.n, 1)'}),
    output,
    'default parameter in main scope'
  );

  tableEqual(t,
    dt.derive({p: 'd.n * lag - op.lag(d.n, 1)'}),
    output,
    'direct parameter in main scope'
  );

  tableEqual(t,
    dt.derive({p: 'd.n - op.lag(d.n, $.lag)'}),
    output,
    'default parameter in operator input scope'
  );

  tableEqual(t,
    dt.derive({p: 'd.n - op.lag(d.n, lag)'}),
    output,
    'direct parameter in operator input scope'
  );

  t.end();
});

tape('derive supports streaming value windows', t => {
  const dt = table({ val: [1, 2, 3, 4, 5] })
    .orderby('val')
    .derive({
      sum: rolling(op.sum('val'), [-2, 0]),
      index: () => op.row_number() - 1
    })
    .derive({
      frame: rolling(op.values('index'), [-2, 0])
    });

  tableEqual(t, dt,
    {
      val: [1, 2, 3, 4, 5],
      sum: [1, 3, 6, 9, 12],
      index: [0, 1, 2, 3, 4],
      frame: [ [0], [0,1], [0,1,2], [1,2,3], [2,3,4] ]
    },
    'derive data'
  );
  t.end();
});

tape('derive supports bigint values', t => {
  const data = {
    v: [1n, 2n, 3n, 4n, 5n]
  };

  function roll(obj) {
    for (const key in obj) {
      obj[key] = rolling(obj[key], [-1, 1]);
    }
    return obj;
  }

  const dt = table(data)
    .derive(roll({
      v:    d => 2n ** d.v,
      sum:  op.sum('v'),
      prod: op.product('v'),
      min:  op.min('v'),
      max:  op.max('v'),
      med:  op.median('v'),
      vals: op.values('v'),
      uniq: op.unique('v')
    }));

  t.deepEqual(
    dt.objects(),
    [
      { v: 2n,  sum: 3n,  prod: 2n,  min: 1n, max: 2n, med: 1n, vals: [ 1n, 2n ], uniq: [ 1n, 2n ] },
      { v: 4n,  sum: 6n,  prod: 6n,  min: 1n, max: 3n, med: 2n, vals: [ 1n, 2n, 3n ], uniq: [ 1n, 2n, 3n ] },
      { v: 8n,  sum: 9n,  prod: 24n, min: 2n, max: 4n, med: 3n, vals: [ 2n, 3n, 4n ], uniq: [ 2n, 3n, 4n ] },
      { v: 16n, sum: 12n, prod: 60n, min: 3n, max: 5n, med: 4n, vals: [ 3n, 4n, 5n ], uniq: [ 3n, 4n, 5n ] },
      { v: 32n, sum: 9n,  prod: 20n, min: 4n, max: 5n, med: 4n, vals: [ 4n, 5n ], uniq: [ 4n, 5n ] }
    ],
    'derive data'
  );

  t.end();
});

tape('derive supports recode function', t => {
  const dt = table({ x: ['foo', 'bar', 'baz'] });

  tableEqual(t,
    dt.derive({ x: d => op.recode(d.x, {foo: 'farp', bar: 'borp'}, 'other') }),
    { x: ['farp', 'borp', 'other'] },
    'derive data, recode inline map Object'
  );

  const map = {
    foo: 'farp',
    bar: 'borp'
  };

  tableEqual(t,
    dt.params({ map })
      .derive({ x: (d, $) => op.recode(d.x, $.map) }),
    { x: ['farp', 'borp', 'baz'] },
    'derive data, recode param map Object'
  );

  const map2 = new Map([['foo', 'farp'], ['bar', 'borp']]);

  tableEqual(t,
    dt.params({ map2 })
      .derive({ x: (d, $) => op.recode(d.x, $.map2) }),
    { x: ['farp', 'borp', 'baz'] },
    'derive data, recode param map Map'
  );

  t.end();
});
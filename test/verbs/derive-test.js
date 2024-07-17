import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { op, rolling, table } from '../../src/index.js';
const { abs, lag, mean, median, rank, stdev } = op;

describe('derive', () => {
  it('creates new columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const dt = table(data).derive({ c: d => d.a + d.b });
    assert.equal(dt.numRows(), 4, 'num rows');
    assert.equal(dt.numCols(), 3, 'num cols');
    tableEqual(dt, { ...data, c: [3, 7, 11, 15] }, 'derive data');
  });

  it('overwrites existing columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    tableEqual(
      table(data).derive({ a: d => d.a + d.b }),
      { ...data, a: [3, 7, 11, 15] },
      'derive data'
    );
  });

  it('drops existing columns with option', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    tableEqual(
      table(data).derive({ z: d => d.a + d.b }, { drop: true }),
      { z: [3, 7, 11, 15] },
      'derive data'
    );
  });

  it('can relocate new columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const t1 = table(data).derive({ z: d => d.a + d.b }, { before: 'a' });

    tableEqual(
      t1,
      { z: [3, 7, 11, 15], ...data },
      'derive data, with before'
    );

    assert.deepEqual(
      t1.columnNames(),
      ['z', 'a', 'b'],
      'derive data columns, with before'
    );

    const t2 = table(data).derive({ z: d => d.a + d.b }, { after: 'a' });

    tableEqual(
      t2,
      { a: data.a, z: [3, 7, 11, 15], b: data.b },
      'derive data, with after'
    );

    assert.deepEqual(
      t2.columnNames(),
      ['a', 'z', 'b'],
      'derive data columns, with after'
    );

    const t3 = table(data).derive({ a: d => -d.a, z: d => d.a + d.b }, { after: 'b' });

    tableEqual(
      t3,
      { a: [-1, -3, -5, -7], b: data.b, z: [3, 7, 11, 15] },
      'derive data, with after and overwrite'
    );

    assert.deepEqual(
      t3.columnNames(),
      ['a', 'b', 'z'],
      'derive data columns, with after and overwrite'
    );
  });

  it('supports aggregate and window operators', () => {
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
    tableEqual(td.select('rank', 'diff', 'roll'), {
      rank: [1, 1, 1, 2, 2, 2, 3, 3, 3, 4],
      diff: [0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
      roll: [0, 1, 2, 1.5, 2.5, 3.5, 3, 4, 5, 6]
    }, 'derive window queries');

    const tz = td
      .ungroup()
      .derive({
        z: ({ a }) => abs(a - mean(a)) / stdev(a)
      });
    tableEqual(tz.select('z'), {
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
    tableEqual(tm.select('mad'), {
      mad: [ 2.5 ]
    }, 'mad');
  });

  it('supports parameters', () => {
    const output = {
      n: [1, 2, 3, 4],
      p: [NaN, 1, 1, 1 ]
    };

    const dt = table({ n: [1, 2, 3, 4] }).params({lag: 1});

    tableEqual(
      dt.derive({p: (d, $) => d.n * $.lag - op.lag(d.n, 1)}),
      output,
      'parameter in main scope'
    );

    tableEqual(
      dt.derive({p: (d, $) => d.n - op.lag(d.n, $.lag)}),
      output,
      'parameter in operator input scope'
    );

    tableEqual(
      dt.derive({p: 'd.n * $.lag - op.lag(d.n, 1)'}),
      output,
      'default parameter in main scope'
    );

    tableEqual(
      dt.derive({p: 'd.n * lag - op.lag(d.n, 1)'}),
      output,
      'direct parameter in main scope'
    );

    tableEqual(
      dt.derive({p: 'd.n - op.lag(d.n, $.lag)'}),
      output,
      'default parameter in operator input scope'
    );

    tableEqual(
      dt.derive({p: 'd.n - op.lag(d.n, lag)'}),
      output,
      'direct parameter in operator input scope'
    );
  });

  it('supports differing window frames', () => {
    const dt = table({ x: [1, 2, 3, 4, 5, 6] })
      .derive({
        cs0: rolling(d => op.sum(d.x)),
        cs4: rolling(d => op.sum(d.x), [-4, 0]),
        cs2: rolling(d => op.sum(d.x), [-2, 0])
      });

    tableEqual(dt,
      {
        x:   [1, 2, 3,  4,  5,  6],
        cs0: [1, 3, 6, 10, 15, 21],
        cs4: [1, 3, 6, 10, 15, 20],
        cs2: [1, 3, 6,  9, 12, 15]
      },
      'derive data'
    );
  });

  it('supports streaming value windows', () => {
    const dt = table({ val: [1, 2, 3, 4, 5] })
      .orderby('val')
      .derive({
        sum: rolling(op.sum('val'), [-2, 0]),
        index: () => op.row_number() - 1
      })
      .derive({
        frame: rolling(op.array_agg('index'), [-2, 0])
      });

    tableEqual(dt,
      {
        val: [1, 2, 3, 4, 5],
        sum: [1, 3, 6, 9, 12],
        index: [0, 1, 2, 3, 4],
        frame: [ [0], [0,1], [0,1,2], [1,2,3], [2,3,4] ]
      },
      'derive data'
    );
  });

  it('supports bigint values', () => {
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
        vals: op.array_agg('v'),
        uniq: op.array_agg_distinct('v')
      }));

    assert.deepEqual(
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
  });

  it('aggregates support ordered tables', () => {
    const rt = table({ v: [3, 1, 4, 2] })
      .orderby('v')
      .derive({ a: op.array_agg('v') });

    tableEqual(rt, {
      v: [1, 2, 3, 4],
      a: [[1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4], [1, 2, 3, 4]]
    }, 'derive data');
  });

  it('supports recode function', () => {
    const dt = table({ x: ['foo', 'bar', 'baz'] });

    tableEqual(
      dt.derive({ x: d => op.recode(d.x, {foo: 'farp', bar: 'borp'}, 'other') }),
      { x: ['farp', 'borp', 'other'] },
      'derive data, recode inline map Object'
    );

    const map = {
      foo: 'farp',
      bar: 'borp'
    };

    tableEqual(
      dt.params({ map })
        .derive({ x: (d, $) => op.recode(d.x, $.map) }),
      { x: ['farp', 'borp', 'baz'] },
      'derive data, recode param map Object'
    );

    const map2 = new Map([['foo', 'farp'], ['bar', 'borp']]);

    tableEqual(
      dt.params({ map2 })
        .derive({ x: (d, $) => op.recode(d.x, $.map2) }),
      { x: ['farp', 'borp', 'baz'] },
      'derive data, recode param map Map'
    );
  });

  it('supports fill window functions', () => {
    const t1 = table({ x: ['a', null, undefined, 'b', NaN, null, 'c'] });

    tableEqual(
      t1.derive({ x: op.fill_down('x') }),
      { x: ['a', 'a', 'a', 'b', 'b', 'b', 'c'] },
      'derive data, fill_down'
    );

    tableEqual(
      t1.derive({ x: op.fill_up('x') }),
      { x: ['a', 'b', 'b', 'b', 'c', 'c', 'c'] },
      'derive data, fill_up'
    );

    const t2 = table({ x: [null, 'a', null] });

    tableEqual(
      t2.derive({ x: op.fill_down('x', '?') }),
      { x: ['?', 'a', 'a'] },
      'derive data, fill_down with default'
    );

    tableEqual(
      t2.derive({ x: op.fill_up('x', '?') }),
      { x: ['a', 'a', '?'] },
      'derive data, fill_up with default'
    );
  });
});

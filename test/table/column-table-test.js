import assert from 'node:assert';
import { not } from '../../src/helpers/selection.js';
import { BitSet } from '../../src/table/BitSet.js';
import { ColumnTable } from '../../src/table/ColumnTable.js';

describe('ColumnTable', () => {
  it('supports varied column types', () => {
    const data = {
      int: Uint32Array.of(1, 2, 3, 4, 5),
      num: Float64Array.of(1.2, 2.3, 3.4, 4.5, 5.6),
      str: ['a1', 'b2', 'c3', 'd4', 'e5'],
      chr: 'abcde',
      obj: [{a:1}, {b:2}, {c:3}, {d:4}, {e:5}]
    };

    const ref = {
      int: [1, 2, 3, 4, 5],
      num: [1.2, 2.3, 3.4, 4.5, 5.6],
      str: ['a1', 'b2', 'c3', 'd4', 'e5'],
      chr: ['a', 'b', 'c', 'd', 'e'],
      obj: [{a:1}, {b:2}, {c:3}, {d:4}, {e:5}]
    };

    const ct = new ColumnTable(data);

    assert.equal(ct.numRows(), 5, 'num rows');
    assert.equal(ct.numCols(), 5, 'num cols');

    const rows = [0, 1, 2, 3, 4];
    const get = {
      int: rows.map(row => ct.get('int', row)),
      num: rows.map(row => ct.get('num', row)),
      str: rows.map(row => ct.get('str', row)),
      chr: rows.map(row => ct.get('chr', row)),
      obj: rows.map(row => ct.get('obj', row))
    };
    assert.deepEqual(get, ref, 'extracted get values match');

    const getters = ['int', 'num', 'str', 'chr', 'obj'].map(name => ct.getter(name));
    const getter = {
      int: rows.map(row => getters[0](row)),
      num: rows.map(row => getters[1](row)),
      str: rows.map(row => getters[2](row)),
      chr: rows.map(row => getters[3](row)),
      obj: rows.map(row => getters[4](row))
    };
    assert.deepEqual(getter, ref, 'extracted getter values match');

    const arrays = ['int', 'num', 'str', 'chr', 'obj'].map(name => ct.array(name));
    const array = {
      int: rows.map(row => arrays[0][row]),
      num: rows.map(row => arrays[1][row]),
      str: rows.map(row => arrays[2][row]),
      chr: rows.map(row => arrays[3][row]),
      obj: rows.map(row => arrays[4][row])
    };
    assert.deepEqual(array, ref, 'extracted array values match');

    const scanned = {
      int: [],
      num: [],
      str: [],
      chr: [],
      obj: []
    };
    ct.scan((row, data) => {
      for (const col in data) {
        scanned[col].push(data[col].at(row));
      }
    });
    assert.deepEqual(scanned, ref, 'scanned values match');
  });

  it('scan supports filtering and ordering', () => {
    const table = new ColumnTable({
      a: ['a', 'a', 'a', 'b', 'b'],
      b: [2, 1, 4, 5, 3]
    });

    let idx = [];
    table.scan(row => idx.push(row), true);
    assert.deepEqual(idx, [0, 1, 2, 3, 4], 'standard scan');

    const filter = new BitSet(5);
    [1, 2, 4].forEach(i => filter.set(i));
    const ft = table.create({ filter });
    idx = [];
    ft.scan(row => idx.push(row), true);
    assert.deepEqual(idx, [1, 2, 4], 'filtered scan');

    const order = (u, v, { b }) => b.at(u) - b.at(v);
    const ot = table.create({ order });
    assert.ok(ot.isOrdered(), 'is ordered');
    idx = [];
    ot.scan(row => idx.push(row), true);
    assert.deepEqual(idx, [1, 0, 4, 2, 3], 'ordered scan');

    idx = [];
    ot.scan(row => idx.push(row));
    assert.deepEqual(idx, [0, 1, 2, 3, 4], 'no-order scan');
  });

  it('scan supports early termination', () => {
    const table = new ColumnTable({
      a: ['a', 'a', 'a', 'b', 'b'],
      b: [2, 1, 4, 5, 3]
    });

    let count;
    const visitor = (row, data, stop) => { if (++count > 1) stop(); };

    count = 0;
    table.scan(visitor, true);
    assert.equal(count, 2, 'standard scan');

    count = 0;
    const filter = new BitSet(5);
    [1, 2, 4].forEach(i => filter.set(i));
    table.create({ filter }).scan(visitor, true);
    assert.equal(count, 2, 'filtered scan');

    count = 0;
    const order = (u, v, { b }) => b.at(u) - b.at(v);
    table.create({ order }).scan(visitor, true);
    assert.equal(count, 2, 'ordered scan');
  });

  it('memoizes indices', () => {
    const ut = new ColumnTable({ v: [1, 3, 2] });
    const ui = ut.indices(false);
    assert.equal(ut.indices(), ui, 'memoize unordered');

    const ot = ut.orderby('v');
    const of = ot.indices(false);
    const oi = ot.indices();
    assert.notEqual(of, oi, 'respect order flag');
    assert.equal(ot.indices(), oi, 'memoize ordered');
    assert.deepEqual(Array.from(oi), [0, 2, 1], 'indices ordered');
  });

  it('supports column values output', () => {
    const dt = new ColumnTable({
        u: ['a', 'a', 'a', 'b', 'b'],
        v: [2, 1, 4, 5, 3]
      })
      .filter(d => d.v > 1)
      .orderby('v');

    assert.deepEqual(
      Array.from(dt.values('u')),
      ['a', 'b', 'a', 'b'],
      'column values, strings'
    );

    assert.deepEqual(
      Array.from(dt.values('v')),
      [2, 3, 4, 5],
      'column values, numbers'
    );

    assert.deepEqual(
      Int32Array.from(dt.values('v')),
      Int32Array.of(2, 3, 4, 5),
      'column values, typed array'
    );
  });

  it('supports column array output', () => {
    const dt = new ColumnTable({
        u: ['a', 'a', 'a', 'b', 'b'],
        v: [2, 1, 4, 5, 3]
      })
      .filter(d => d.v > 1)
      .orderby('v');

    assert.deepEqual(
      dt.array('u'),
      ['a', 'b', 'a', 'b'],
      'column array, strings'
    );

    assert.deepEqual(
      dt.array('v'),
      [2, 3, 4, 5],
      'column array, numbers'
    );

    assert.deepEqual(
      dt.array('v', Int32Array),
      Int32Array.of(2, 3, 4, 5),
      'column array, typed array'
    );
  });

  it('supports object output', () => {
    const output = [
      { u: 'a', v: 1 },
      { u: 'a', v: 2 },
      { u: 'b', v: 3 },
      { u: 'a', v: 4 },
      { u: 'b', v: 5 }
    ];

    const dt = new ColumnTable({
        u: ['a', 'a', 'a', 'b', 'b'],
        v: [2, 1, 4, 5, 3]
      })
      .orderby('v');

    assert.deepEqual(dt.objects(), output, 'object data');

    assert.deepEqual(
      dt.objects({ limit: 3 }),
      output.slice(0, 3),
      'object data with limit'
    );

    assert.deepEqual(
      dt.objects({ columns: not('v') }),
      output.map(d => ({ u: d.u })),
      'object data with column selection'
    );

    assert.deepEqual(
      dt.objects({ columns: { u: 'a', v: 'b'} }),
      output.map(d => ({ a: d.u, b: d.v })),
      'object data with renaming column selection'
    );

    assert.deepEqual(
      dt.object(),
      output[0],
      'single object, implicit row'
    );

    assert.deepEqual(
      dt.object(0),
      output[0],
      'single object, explicit row'
    );

    assert.deepEqual(
      dt.object(1),
      output[1],
      'single object, explicit row'
    );
  });

  it('supports grouped object output', () => {
    const dt = new ColumnTable({
        u: ['a', 'a', 'a', 'b', 'b'],
        v: [2, 1, 4, 5, 3]
      })
      .orderby('v');

    assert.deepEqual(
      dt.groupby('u').objects({ grouped: 'object' }),
      {
        a: [
          { u: 'a', v: 1 },
          { u: 'a', v: 2 },
          { u: 'a', v: 4 }
        ],
        b: [
          { u: 'b', v: 3 },
          { u: 'b', v: 5 }
        ]
      },
      'grouped object output'
    );

    assert.deepEqual(
      dt.groupby('u').objects({ grouped: 'entries' }),
      [
        ['a',[
          { u: 'a', v: 1 },
          { u: 'a', v: 2 },
          { u: 'a', v: 4 }
        ]],
        ['b',[
          { u: 'b', v: 3 },
          { u: 'b', v: 5 }
        ]]
      ],
      'grouped entries output'
    );

    assert.deepEqual(
      dt.groupby('u').objects({ grouped: 'map' }),
      new Map([
        ['a',[
          { u: 'a', v: 1 },
          { u: 'a', v: 2 },
          { u: 'a', v: 4 }
        ]],
        ['b',[
          { u: 'b', v: 3 },
          { u: 'b', v: 5 }
        ]]
      ]),
      'grouped map output'
    );

    assert.deepEqual(
      dt.groupby('u').objects({ grouped: true }),
      new Map([
        ['a',[
          { u: 'a', v: 1 },
          { u: 'a', v: 2 },
          { u: 'a', v: 4 }
        ]],
        ['b',[
          { u: 'b', v: 3 },
          { u: 'b', v: 5 }
        ]]
      ]),
      'grouped map output, using true'
    );

    assert.deepEqual(
      dt.filter(d => d.v < 4).groupby('u').objects({ grouped: 'object' }),
      {
        a: [
          { u: 'a', v: 1 },
          { u: 'a', v: 2 }
        ],
        b: [
          { u: 'b', v: 3 }
        ]
      },
      'grouped object output, with filter'
    );

    assert.deepEqual(
      dt.groupby('u').objects({ limit: 3, grouped: 'object' }),
      {
        a: [
          { u: 'a', v: 1 },
          { u: 'a', v: 2 }
        ],
        b: [
          { u: 'b', v: 3 }
        ]
      },
      'grouped object output, with limit'
    );

    assert.deepEqual(
      dt.groupby('u').objects({ offset: 2, grouped: 'object' }),
      {
        a: [
          { u: 'a', v: 4 }
        ],
        b: [
          { u: 'b', v: 3 },
          { u: 'b', v: 5 }
        ]
      },
      'grouped object output, with offset'
    );

    const dt2 = new ColumnTable({
        u: ['a', 'a', 'a', 'b', 'b'],
        w: ['y', 'x', 'y', 'z', 'x'],
        v: [2, 1, 4, 5, 3]
      })
      .orderby('v');

    assert.deepEqual(
      dt2.groupby(['u', 'w']).objects({ grouped: 'object' }),
      {
        a: {
          x: [{ u: 'a', w: 'x', v: 1 }],
          y: [{ u: 'a', w: 'y', v: 2 },{ u: 'a', w: 'y', v: 4 }]
        },
        b: {
          x: [{ u: 'b', w: 'x', v: 3 }],
          z: [{ u: 'b', w: 'z', v: 5 }]
        }
      },
      'grouped nested object output'
    );

    assert.deepEqual(
      dt2.groupby(['u', 'w']).objects({ grouped: 'entries' }),
      [
        ['a', [
          ['y', [{ u: 'a', w: 'y', v: 2 }, { u: 'a', w: 'y', v: 4 }]],
          ['x', [{ u: 'a', w: 'x', v: 1 }]]
        ]],
        ['b', [
          ['z', [{ u: 'b', w: 'z', v: 5 }]],
          ['x', [{ u: 'b', w: 'x', v: 3 }]]
        ]]
      ],
      'grouped nested entries output'
    );

    assert.deepEqual(
      dt2.groupby(['u', 'w']).objects({ grouped: 'map' }),
      new Map([
        ['a', new Map([
          ['x', [{ u: 'a', w: 'x', v: 1 }]],
          ['y', [{ u: 'a', w: 'y', v: 2 },{ u: 'a', w: 'y', v: 4 }]]
        ])],
        ['b', new Map([
          ['x', [{ u: 'b', w: 'x', v: 3 }]],
          ['z', [{ u: 'b', w: 'z', v: 5 }]]
        ])]
      ]),
      'grouped nested map output'
    );
  });

  it('supports iterator output', () => {
    const output = [
      { u: 'a', v: 2 },
      { u: 'a', v: 1 },
      { u: 'a', v: 4 },
      { u: 'b', v: 5 },
      { u: 'b', v: 3 }
    ];

    const dt = new ColumnTable({
        u: ['a', 'a', 'a', 'b', 'b'],
        v: [2, 1, 4, 5, 3]
      });

    assert.deepEqual([...dt], output, 'iterator data');
    assert.deepEqual(
      [...dt.orderby('v')],
      output.slice().sort((a, b) => a.v - b.v),
      'iterator data orderby'
    );
  });

  it('toString shows table state', () => {
    const dt = new ColumnTable({
      a: ['a', 'a', 'a', 'b', 'b'],
      b: [2, 1, 4, 5, 3]
    });
    assert.equal(
      dt.toString(),
      '[object Table: 2 cols x 5 rows]',
      'table toString'
    );

    const filter = new BitSet(5);
    [1, 2, 4].forEach(i => filter.set(i));
    assert.equal(
      dt.create({ filter }).toString(),
      '[object Table: 2 cols x 3 rows (5 backing)]',
      'filtered table toString'
    );

    const groups = { names: ['a'], get: [row => dt.get('a', row)], size: 2 };
    assert.equal(
      dt.create({ groups }).toString(),
      '[object Table: 2 cols x 5 rows, 2 groups]',
      'grouped table toString'
    );

    const order = (u, v, { b }) => b[u] - b[v];
    assert.equal(
      dt.create({ order }).toString(),
      '[object Table: 2 cols x 5 rows, ordered]',
      'ordered table toString'
    );

    assert.equal(
      dt.create({ filter, order, groups }).toString(),
      '[object Table: 2 cols x 3 rows (5 backing), 2 groups, ordered]',
      'filtered, grouped, ordered table toString'
    );
  });
});

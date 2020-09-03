import tape from 'tape';
import BitSet from '../../src/table/bit-set';
import ColumnTable from '../../src/table/column-table';

tape('ColumnTable supports varied column types', t => {
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

  t.equal(ct.numRows(), 5, 'num rows');
  t.equal(ct.numCols(), 5, 'num cols');

  const rows = [0, 1, 2, 3, 4];
  const extracted = {
    int: rows.map(row => ct.get('int', row)),
    num: rows.map(row => ct.get('num', row)),
    str: rows.map(row => ct.get('str', row)),
    chr: rows.map(row => ct.get('chr', row)),
    obj: rows.map(row => ct.get('obj', row))
  };
  t.deepEqual(extracted, ref, 'extracted values match');

  const scanned = {
    int: [],
    num: [],
    str: [],
    chr: [],
    obj: []
  };
  ct.scan((row, data) => {
    for (const col in data) {
      scanned[col].push(data[col].get(row));
    }
  });
  t.deepEqual(scanned, ref, 'scanned values match');

  t.end();
});

tape('ColumnTable scan supports filtering and ordering', t => {
  const table = new ColumnTable({
    a: ['a', 'a', 'a', 'b', 'b'],
    b: [2, 1, 4, 5, 3]
  });

  let idx = [];
  table.scan(row => idx.push(row), true);
  t.deepEqual(idx, [0, 1, 2, 3, 4], 'standard scan');

  const filter = new BitSet(5);
  [1, 2, 4].forEach(i => filter.set(i));
  const ft = table.create({ filter });
  idx = [];
  ft.scan(row => idx.push(row), true);
  t.deepEqual(idx, [1, 2, 4], 'filtered scan');

  const order = (u, v, { b }) => b.get(u) - b.get(v);
  const ot = table.create({ order });
  t.ok(ot.isOrdered(), 'is ordered');
  idx = [];
  ot.scan(row => idx.push(row), true);
  t.deepEqual(idx, [1, 0, 4, 2, 3], 'ordered scan');

  idx = [];
  ot.scan(row => idx.push(row));
  t.deepEqual(idx, [0, 1, 2, 3, 4], 'no-order scan');

  t.end();
});

tape('ColumnTable supports object output', t => {
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

  t.deepEqual(dt.objects(), output, 'object data');
  t.deepEqual(
    dt.objects({ limit: 3 }),
    output.slice(0, 3),
    'object data with limit'
  );

  t.end();
});

tape('ColumnTable toString shows table state', t => {
  const dt = new ColumnTable({
    a: ['a', 'a', 'a', 'b', 'b'],
    b: [2, 1, 4, 5, 3]
  });
  t.equal(
    dt.toString(),
    '[object Table: 2 cols x 5 rows]',
    'table toString'
  );

  const filter = new BitSet(5);
  [1, 2, 4].forEach(i => filter.set(i));
  t.equal(
    dt.create({ filter }).toString(),
    '[object Table: 2 cols x 3 rows (5 backing)]',
    'filtered table toString'
  );

  const groups = { names: ['a'], get: [row => dt.get('a', row)], size: 2 };
  t.equal(
    dt.create({ groups }).toString(),
    '[object Table: 2 cols x 5 rows, 2 groups]',
    'grouped table toString'
  );

  const order = (u, v, { b }) => b[u] - b[v];
  t.equal(
    dt.create({ order }).toString(),
    '[object Table: 2 cols x 5 rows, ordered]',
    'ordered table toString'
  );

  t.equal(
    dt.create({ filter, order, groups }).toString(),
    '[object Table: 2 cols x 3 rows (5 backing), 2 groups, ordered]',
    'filtered, grouped, ordered table toString'
  );

  t.end();
});
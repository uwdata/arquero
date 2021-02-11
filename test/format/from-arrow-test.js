import tape from 'tape';
import tableEqual from '../table-equal';
import fromArrow from '../../src/format/from-arrow';
import { not } from '../../src/helpers/selection';
import { table } from '../../src';
import { Type, Utf8 } from 'apache-arrow';

function arrowTable(data, types) {
  return table(data).toArrow({ types });
}

tape('fromArrow imports Apache Arrow tables', t => {
  const data = {
    u: [1, 2, 3, 4, 5],
    v: ['a', 'b', null, 'd', 'e']
  };
  const at = arrowTable(data);

  tableEqual(t, fromArrow(at), data, 'arrow data');
  t.end();
});

tape('fromArrow can unpack Apache Arrow tables', t => {
  const data = {
    u: [1, 2, 3, 4, 5],
    v: ['a', 'b', null, 'd', 'e'],
    x: ['cc', 'dd', 'cc', 'dd', 'cc'],
    y: ['aa', 'aa', null, 'bb', 'bb']
  };
  const at = arrowTable(data, { v: new Utf8() });
  const dt = fromArrow(at);

  tableEqual(t, dt, data, 'arrow data');
  t.ok(dt.column('x').keyFor, 'create dictionary column without nulls');
  t.ok(dt.column('y').keyFor, 'create dictionary column with nulls');
  t.end();
});

tape('fromArrow can select Apache Arrow columns', t => {
  const data = {
    u: [1, 2, 3, 4, 5],
    v: ['a', 'b', null, 'd', 'e'],
    x: ['cc', 'dd', 'cc', 'dd', 'cc'],
    y: ['aa', 'aa', null, 'bb', 'bb']
  };
  const at = arrowTable(data);

  const s1 = fromArrow(at, { columns: 'x' });
  t.deepEqual(s1.columnNames(), ['x'], 'select by column name');
  tableEqual(t, s1, { x: data.x }, 'correct columns selected');

  const s2 = fromArrow(at, { columns: ['u', 'y'] });
  t.deepEqual(s2.columnNames(), ['u', 'y'], 'select by column names');
  tableEqual(t, s2, { u: data.u, y: data.y }, 'correct columns selected');

  const s3 = fromArrow(at, { columns: not('u', 'y') });
  t.deepEqual(s3.columnNames(), ['v', 'x'], 'select by helper');
  tableEqual(t, s3, { v: data.v, x: data.x }, 'correct columns selected');

  const s4 = fromArrow(at, { columns: { u: 'a', x: 'b'} });
  t.deepEqual(s4.columnNames(), ['a', 'b'], 'select by helper');
  tableEqual(t, s4, { a: data.u, b: data.x }, 'correct columns selected');

  t.end();
});

tape('fromArrow can read Apache Arrow lists', t => {
  const l = [[1, 2, 3], null, [4, 5]];
  const at = arrowTable({ l });

  if (at.getColumn('l').typeId !== Type.List) {
    t.fail('Arrow column should have List type');
  }
  tableEqual(t, fromArrow(at), { l }, 'extract Arrow list');
  t.end();
});

tape('fromArrow can read Apache Arrow fixed-size lists', t => {
  const l = [[1, 2], null, [4, 5]];
  const at = arrowTable({ l });

  if (at.getColumn('l').typeId !== Type.FixedSizeList) {
    t.fail('Arrow column should have FixedSizeList type');
  }
  tableEqual(t, fromArrow(at), { l }, 'extract Arrow list');
  t.end();
});

tape('fromArrow can read Apache Arrow structs', t => {
  const s = [{ foo: 1, bar: [2, 3] }, null, { foo: 2, bar: [4] }];
  const at = arrowTable({ s });

  if (at.getColumn('s').typeId !== Type.Struct) {
    t.fail('Arrow column should have Struct type');
  }
  tableEqual(t, fromArrow(at), { s }, 'extract Arrow struct');

  t.end();
});

tape('fromArrow can read nested Apache Arrow structs', t => {
  const s = [{ foo: 1, bar: { bop: 2 } }, { foo: 2, bar: { bop: 3 } }];
  const at = arrowTable({ s });

  if (at.getColumn('s').typeId !== Type.Struct) {
    t.fail('Arrow column should have Struct type');
  }
  tableEqual(t, fromArrow(at), { s }, 'extract nested Arrow struct');

  t.end();
});

tape('fromArrow can read filtered Apache Arrow tables', t => {
  const data = {
    n: [1, null, null, 4, 5],
    u: Int8Array.of(1, 2, 3, 4, 5),
    v: Float64Array.of(1.2, 2.3, 3.4, 4.5, 5.6),
    w: ['a', 'b', null, 'd', 'e'],
    x: ['cc', 'dd', 'cc', 'dd', 'cc'],
    y: ['aa', 'aa', null, 'bb', 'bb']
  };
  const at = arrowTable(data, { w: new Utf8() });

  const valid = [1, 1, 0, 0, 1];
  const ft = at.filter(idx => valid[idx]);
  const dt = fromArrow(ft);
  const rt = dt.reify();

  t.equal(dt.totalRows(), 5, 'filtered table total rows');
  t.equal(dt.numRows(), 3, 'filtered table active rows');
  t.deepEqual(
    [...dt],
    [
      { n: 1,    u: 1, v: 1.2, w: 'a', x: 'cc', y: 'aa' },
      { n: null, u: 2, v: 2.3, w: 'b', x: 'dd', y: 'aa' },
      { n: 5,    u: 5, v: 5.6, w: 'e', x: 'cc', y: 'bb' }
    ],
    'extract filtered Arrow data'
  );
  tableEqual(t, rt, {
    n: [1, null, 5],
    u: [1, 2, 5],
    v: [1.2, 2.3, 5.6],
    w: ['a', 'b', 'e'],
    x: ['cc', 'dd', 'cc'],
    y: ['aa', 'aa', 'bb']
  }, 'extract reified filtered Arrow data');

  t.end();
});
import tape from 'tape';
import fromArrow from '../../src/format/from-arrow';
import { not } from '../../src/helpers/selection';
import {
  arrowColumn,
  arrowDictionary,
  arrowListColumn,
  arrowStructColumn,
  arrowTable
} from '../arrow-stubs';

tape('fromArrow imports Apache Arrow tables', t => {
  const u = arrowColumn([1, 2, 3, 4, 5]);
  const v = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const at = arrowTable({ u, v });
  const dt = fromArrow(at);

  // works because for stubs, column === chunks[0]
  t.deepEqual(dt.data(), { u, v }, 'reuse input columns');
  t.end();
});

tape('fromArrow can unpack Apache Arrow tables', t => {
  const u = arrowColumn([1, 2, 3, 4, 5]);
  const v = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const x = arrowDictionary(['cc', 'dd', 'cc', 'dd', 'cc']);
  const y = arrowDictionary(['aa', 'aa', null, 'bb', 'bb']);
  const at = arrowTable({ u, v, x, y });
  const dt = fromArrow(at, { unpack: true });

  t.notDeepEqual(dt.data(), { u, v, x, y }, 'unpack to new columns');
  t.deepEqual([...dt.column('u')], u._data, 'match column data without nulls');
  t.deepEqual([...dt.column('v')], v._data, 'match column data with nulls');
  t.ok(dt.column('x').keyFor, 'create dictionary column without nulls');
  t.ok(dt.column('y').keyFor, 'create dictionary column with nulls');
  t.end();
});

tape('fromArrow can select Apache Arrow columns', t => {
  const u = arrowColumn([1, 2, 3, 4, 5]);
  const v = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const x = arrowDictionary(['cc', 'dd', 'cc', 'dd', 'cc']);
  const y = arrowDictionary(['aa', 'aa', null, 'bb', 'bb']);
  const at = arrowTable({ u, v, x, y });

  const s1 = fromArrow(at, { columns: 'x' });
  t.deepEqual(s1.columnNames(), ['x'], 'select by column name');
  t.equal(s1.column('x').vector, x, 'correct column selected');

  const s2 = fromArrow(at, { columns: ['u', 'y'] });
  t.deepEqual(s2.columnNames(), ['u', 'y'], 'select by column names');
  t.equal(s2.column('u'), u, 'correct column selected');
  t.equal(s2.column('y').vector, y, 'correct column selected');

  const s3 = fromArrow(at, { columns: not('u', 'y') });
  t.deepEqual(s3.columnNames(), ['v', 'x'], 'select by helper');
  t.equal(s3.column('v'), v, 'correct column selected');
  t.equal(s3.column('x').vector, x, 'correct column selected');

  const s4 = fromArrow(at, { columns: { u: 'a', x: 'b'} });
  t.deepEqual(s4.columnNames(), ['a', 'b'], 'select by helper');
  t.equal(s4.column('a'), u, 'correct column selected');
  t.equal(s4.column('b').vector, x, 'correct column selected');

  t.end();
});

tape('fromArrow can read Apache Arrow lists', t => {
  const d = [[1, 2, 3], null, [4, 5]];
  const l = arrowListColumn(d);
  const at = arrowTable({ l });
  const dt = fromArrow(at);

  t.deepEqual([...dt.column('l')], d, 'extract Arrow list');
  t.end();
});

tape('fromArrow can read Apache Arrow fixed-size lists', t => {
  const d = [[1, 2], null, [4, 5]];
  const l = arrowListColumn(d, 2);
  const at = arrowTable({ l });
  const dt = fromArrow(at);

  t.deepEqual([...dt.column('l')], d, 'extract Arrow list');
  t.end();
});

tape('fromArrow can read Apache Arrow structs', t => {
  const d = [{ foo: 1, bar: [2, 3] }, null, { foo: 2, bar: [4] }];
  const s = arrowStructColumn(d, Object.keys(d[0]), [
    arrowColumn(d.map(v => v ? v.foo : null)),
    arrowListColumn(d.map(v => v ? v.bar : null))
  ]);
  const at = arrowTable({ s });
  const dt = fromArrow(at);

  t.deepEqual([...dt.column('s')], d, 'extract Arrow struct');
  t.end();
});

tape('fromArrow can read nested Apache Arrow structs', t => {
  const d = [{ foo: 1, bar: { bop: 2 } }, { foo: 2, bar: { bop: 3 } }];
  const s = arrowStructColumn(d, Object.keys(d[0]), [
    arrowColumn(d.map(v => v ? v.foo : null)),
    arrowStructColumn([1, 1], ['bop'], [ arrowColumn([2, 3]) ])
  ]);
  const at = arrowTable({ s });
  const dt = fromArrow(at);

  t.deepEqual([...dt.column('s')], d, 'extract nested Arrow struct');
  t.end();
});

tape('fromArrow can read filtered Apache Arrow tables', t => {
  const n = arrowColumn([1, null, null, 4, 5], 2);
  const u = arrowColumn(Int8Array.of(1, 2, 3, 4, 5));
  const v = arrowColumn(Float64Array.of(1.2, 2.3, 3.4, 4.5, 5.6));
  const w = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const x = arrowDictionary(['cc', 'dd', 'cc', 'dd', 'cc']);
  const y = arrowDictionary(['aa', 'aa', null, 'bb', 'bb']);

  const ft = arrowTable({ n, u, v, w, x, y }, [1, 1, 0, 0, 1]);
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
  t.deepEqual(
    rt.columnNames().map(name => [...rt.column(name)]),
    [
      [1, null, 5],
      [1, 2, 5],
      [1.2, 2.3, 5.6],
      ['a', 'b', 'e'],
      ['cc', 'dd', 'cc'],
      ['aa', 'aa', 'bb']
    ],
    'extract reified filtered Arrow data'
  );

  t.end();
});
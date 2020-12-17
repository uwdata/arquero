import tape from 'tape';
import fromArrow, { LIST, STRUCT } from '../../src/format/from-arrow';
import { not } from '../../src/verbs';

// test stubs for Arrow Column API
function arrowColumn(data, nullCount = 0) {
  const column = {
    length: data.length,
    get: row => data[row],
    toArray: () => data,
    isValid: row => data[row] != null,
    [Symbol.iterator]: () => data[Symbol.iterator](),
    nullCount,
    _data: data
  };

  column.chunks = [ column ];
  return column;
}

function arrowDictionary(data) {
  let key = -1;
  let nullCount = 0;
  const bitmap = new Uint8Array(Math.ceil(data.length / 8)).fill(0xFF);
  const lut = {};
  const dict = [];
  const keys = data.map((v, i) => {
    if (v == null) {
      ++nullCount;
      bitmap[i >> 3] = bitmap[i >> 3] & ~(1 << (i & 7));
      return 0;
    }
    if (lut[v] == null) {
      lut[v] = ++key;
      dict[key] = v;
      return key;
    } else {
      return lut[v];
    }
  });

  const column = {
    length: data.length,
    get: row => data[row],
    toArray: () => data,
    [Symbol.iterator]: () => data[Symbol.iterator](),
    dictionary: { toArray: () => dict, get: idx => dict[idx] },
    nullCount,
    nullBitmap: nullCount ? bitmap : null,
    data: { values: keys, length: data.length },
    _data: data
  };

  column.chunks = [ column ];
  return column;
}

function arrowListColumn(data) {
  const column = arrowColumn(data.map(d => d ? arrowColumn(d) : null));
  column.typeId = LIST;
  column.numChildren = 1;
  return column;
}

function arrowStructColumn(valid, names, children) {
  const column = {
    type: { children: names.map(name => ({ name })) },
    typeId: STRUCT,
    length: valid.length,
    numChildren: names.length,
    getChildAt: i => children[i],
    isValid: row => !!valid[row]
  };

  column.chunks = [ column ];
  return column;
}

// test stub for Arrow Table API
function arrowTable(columns, filter) {
  const names = Object.keys(columns);
  const length = columns[names[0]].length;

  return {
    getColumn: name => columns[name],
    length,
    schema: { fields: names.map(name => ({ name })) },
    count: filter
      ? () => filter.reduce((s, v) => s += +v, 0)
      : () => length,
    scan: filter
      ? (next, bind) => {
          bind();
          for (let i = 0; i < length; ++i) (filter[i] ? next(i) : 0);
        }
      : (next, bind) => {
          bind();
          for (let i = 0; i < length; ++i) next(i);
        }
  };
}

tape('fromArrow imports Apache Arrow tables', t => {
  const u = arrowColumn([1, 2, 3, 4, 5]);
  const v = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const at = arrowTable({ u, v });
  const dt = fromArrow(at);

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
  t.equal(dt.column('u').data, u._data, 'reuse column data without nulls');
  t.notEqual(dt.column('v').data, u._data, 'copy column data with nulls');
  t.deepEqual(dt.column('x').data, x._data, 'unpack dictionary column without nulls');
  t.deepEqual(dt.column('y').data, y._data, 'unpack dictionary column with nulls');
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
  t.equal(s1.column('x'), x, 'correct column selected');

  const s2 = fromArrow(at, { columns: ['u', 'y'] });
  t.deepEqual(s2.columnNames(), ['u', 'y'], 'select by column names');
  t.equal(s2.column('u'), u, 'correct column selected');
  t.equal(s2.column('y'), y, 'correct column selected');

  const s3 = fromArrow(at, { columns: not('u', 'y') });
  t.deepEqual(s3.columnNames(), ['v', 'x'], 'select by helper');
  t.equal(s3.column('v'), v, 'correct column selected');
  t.equal(s3.column('x'), x, 'correct column selected');

  const s4 = fromArrow(at, { columns: { u: 'a', x: 'b'} });
  t.deepEqual(s4.columnNames(), ['a', 'b'], 'select by helper');
  t.equal(s4.column('a'), u, 'correct column selected');
  t.equal(s4.column('b'), x, 'correct column selected');

  t.end();
});

tape('fromArrow can read Apache Arrow lists', t => {
  const d = [[1, 2, 3], null, [4, 5]];
  const l = arrowListColumn(d);
  const at = arrowTable({ l });
  const dt = fromArrow(at);

  t.deepEqual(dt.column('l').data, d, 'extract Arrow list');
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

  t.deepEqual(dt.column('s').data, d, 'extract Arrow struct');
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

  t.deepEqual(dt.column('s').data, d, 'extract nested Arrow struct');
  t.end();
});

tape('fromArrow can read filtered Apache Arrow tables', t => {
  const n = arrowColumn([1, null, null, 4, 5], 2);
  n.typeId = 2;
  n.ArrayType = Int32Array;

  const u = arrowColumn(Int8Array.of(1, 2, 3, 4, 5));
  u.typeId = 2;
  u.ArrayType = Int8Array;

  const v = arrowColumn(Float64Array.of(1.2, 2.3, 3.4, 4.5, 5.6));
  v.typeId = 3;
  v.ArrayType = Float64Array;

  const w = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const x = arrowDictionary(['cc', 'dd', 'cc', 'dd', 'cc']);
  const y = arrowDictionary(['aa', 'aa', null, 'bb', 'bb']);
  const ft = arrowTable({ n, u, v, w, x, y }, [1, 1, 0, 0, 1]);
  const dt = fromArrow(ft);

  const data = ['n', 'u', 'v', 'w', 'x', 'y']
    .map(name => dt.column(name).data);

  t.ok(
    data[0] instanceof Array &&
    data[1] instanceof Int8Array &&
    data[2] instanceof Float64Array,
    'proper array types are used'
  );

  t.deepEqual(
    data.map(col => Array.from(col)),
    [
      [1, null, 5], [1, 2, 5], [1.2, 2.3, 5.6],
      ['a', 'b', 'e'], ['cc', 'dd', 'cc'], ['aa', 'aa', 'bb']
    ],
    'extract filtered Arrow data'
  );

  t.end();
});
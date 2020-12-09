import tape from 'tape';
import fromArrow, { LIST, STRUCT } from '../../src/format/from-arrow';

// test stubs for Arrow Column API
function arrowColumn(data, nullCount = 0) {
  return {
    length: data.length,
    get: row => data[row],
    toArray: () => data,
    [Symbol.iterator]: () => data[Symbol.iterator](),
    nullCount,
    _data: data
  };
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
    dictionary: { toArray: () => dict },
    nullCount,
    nullBitmap: nullCount ? bitmap : null,
    data: { values: keys, length: data.length },
    _data: data
  };

  column.chunks = [ column ];
  return column;
}

function arrowListColumn(data) {
  const c = arrowColumn(data.map(d => arrowColumn(d)));
  c.typeId = LIST;
  c.numChildren = 1;
  return c;
}

function arrowStructColumn(names, children) {
  return {
    type: { children: names.map(name => ({ name })) },
    typeId: STRUCT,
    length: children[0].length,
    numChildren: names.length,
    getChildAt: i => children[i]
  };
}

// test stub for Arrow Table API
function arrowTable(columns) {
  return {
    schema: {
      fields: Object.keys(columns).map(name => ({ name }))
    },
    getColumn: name => columns[name]
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

tape('fromArrow can read Apache Arrow lists', t => {
  const d = [[1, 2, 3], [4, 5]];
  const l = arrowListColumn(d);
  const at = arrowTable({ l });
  const dt = fromArrow(at);

  t.deepEqual(dt.column('l').data, d, 'extract Arrow list');
  t.end();
});

tape('fromArrow can read Apache Arrow structs', t => {
  const d = [{ foo: 1, bar: [2, 3] }, { foo: 2, bar: [4] }];
  const s = arrowStructColumn(Object.keys(d[0]), [
    arrowColumn(d.map(v => v.foo)),
    arrowListColumn(d.map(v => v.bar))
  ]);
  const at = arrowTable({ s });
  const dt = fromArrow(at);

  t.deepEqual(dt.column('s').data, d, 'extract Arrow struct');
  t.end();
});

tape('fromArrow can read nested Apache Arrow structs', t => {
  const d = [{ foo: 1, bar: { bop: 2 } }, { foo: 2, bar: { bop: 3 } }];
  const s = arrowStructColumn(Object.keys(d[0]), [
    arrowColumn(d.map(v => v.foo)),
    arrowStructColumn(['bop'], [ arrowColumn([2, 3]) ])
  ]);
  const at = arrowTable({ s });
  const dt = fromArrow(at);

  t.deepEqual(dt.column('s').data, d, 'extract nested Arrow struct');
  t.end();
});
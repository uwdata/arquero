// Hardwire Arrow type ids
// https://github.com/apache/arrow/blob/master/js/src/enum.ts
const LIST = 12;
const STRUCT = 13;
const FIXED_SIZE_LIST = 16;

// test stubs for Arrow Column API
export function arrowColumn(data, nullCount = 0) {
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

export function arrowDictionary(data) {
  let key = -1;
  let nullCount = 0;
  const bitmap = new Uint8Array(Math.ceil(data.length / 8)).fill(0xFF);
  const lut = {};
  const dict = [];
  const keys = Int32Array.from(data.map((v, i) => {
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
  }));

  const column = {
    length: data.length,
    type: { indices: { ArrayType: Int32Array }},
    get: row => data[row],
    toArray: () => data,
    [Symbol.iterator]: () => data[Symbol.iterator](),
    dictionary: { toArray: () => dict, get: idx => dict[idx] },
    nullCount,
    nullBitmap: nullCount ? bitmap : null,
    values: keys,
    data: { values: keys, length: data.length },
    _data: data
  };

  column.chunks = [ column ];
  return column;
}

export function arrowListColumn(data, len) {
  const column = arrowColumn(
    data.map(d => d ? arrowColumn(d) : null),
    data.reduce((nc, d) => d ? nc : ++nc, 0)
  );
  column.typeId = len != null ? FIXED_SIZE_LIST : LIST;
  column.numChildren = 1;
  return column;
}

export function arrowStructColumn(valid, names, children) {
  const column = {
    type: { children: names.map(name => ({ name })) },
    typeId: STRUCT,
    length: valid.length,
    nullCount: valid.reduce((nc, d) => d ? nc : ++nc, 0),
    numChildren: names.length,
    getChildAt: i => children[i],
    isValid: row => !!valid[row]
  };

  column.chunks = [ column ];
  return column;
}

// test stub for Arrow Table API
export function arrowTable(columns, filter) {
  const names = Object.keys(columns);
  const length = columns[names[0]].length;

  const table = {
    getColumn: name => columns[name],
    length,
    schema: { fields: names.map(name => ({ name })) },
    count: filter
      ? () => filter.reduce((s, v) => s += +v, 0)
      : () => length,
    scan: filter
      ? (next, bind) => {
          bind(table);
          for (let i = 0; i < length; ++i) (filter[i] ? next(i) : 0);
        }
      : (next, bind) => {
          bind(table);
          for (let i = 0; i < length; ++i) next(i);
        }
  };

  table.chunks = [ table ];
  return table;
}
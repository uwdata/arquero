import { op } from '..';

function flatten(chunks, length, type) {
  const array = new type.ArrayType(length);
  const n = chunks.length;
  for (let i = 0, idx = 0; i < n; ++i) {
    array.set(chunks[i].values, idx);
    idx += chunks[i].length;
  }
  return array;
}

function nullKeys(chunks, keys, key) {
  // iterate over null bitmaps, encode null values as key
  keys = keys.slice();
  const n = chunks.length;
  for (let i = 0, idx = 0, m, base, bits, byte; i < n; ++i) {
    bits = chunks[i].nullBitmap;
    if (bits && (m = bits.length)) {
      for (let j = 0; j < m; ++j) {
        byte = bits[j];
        if (byte !== 255) {
          base = idx + (j << 3);
          if (byte & (1 << 0) === 0) keys[base + 0] = key;
          if (byte & (1 << 1) === 0) keys[base + 1] = key;
          if (byte & (1 << 2) === 0) keys[base + 2] = key;
          if (byte & (1 << 3) === 0) keys[base + 3] = key;
          if (byte & (1 << 4) === 0) keys[base + 4] = key;
          if (byte & (1 << 5) === 0) keys[base + 5] = key;
          if (byte & (1 << 6) === 0) keys[base + 6] = key;
          if (byte & (1 << 7) === 0) keys[base + 7] = key;
        }
      }
    }
    idx += chunks[i].length;
  }
  return keys;
}

export function dictionaryColumn(arrow) {
  const length = arrow.length;
  const chunks = arrow.chunks;
  const nulls = chunks[0].nullCount;
  const keys = chunks.length === 1 && nulls === 0
    ? chunks[0].values
    : flatten(chunks, length, arrow.type.indices);

  const dict = chunks[chunks.length - 1].dictionary;
  const size = dict.length;
  const values = Array(size);

  function value(key) {
    const v = key != null ? values[key] : null;
    return v === undefined
      ? (key < 0 || key >= size ? null : (values[key] = dict.get(key)))
      : v;
  }

  let groupKeys = nulls ? null : keys;

  return {
    arrow,
    length,
    value,

    get: nulls
      ? row => arrow.isValid(row) ? value(keys[row]) : null
      : row => value(keys[row]),

    key: nulls
      ? row => arrow.isValid(row) ? keys[row] : null
      : row => keys[row],

    keyFor(value) {
      for (let i = 0; i < size; ++i) {
        if (values[i] === undefined) values[i] = dict.get(i);
        if (values[i] === value) return i;
      }
      return -1;
    },

    groups(names) {
      const s = size + (nulls ? 1 : 0);
      return {
        keys: groupKeys || (groupKeys = nullKeys(chunks, keys, size)),
        get: [value],
        names,
        rows: op.sequence(0, s),
        size: s
      };
    },

    [Symbol.iterator]() {
      return arrow[Symbol.iterator]();
    }
  };
}
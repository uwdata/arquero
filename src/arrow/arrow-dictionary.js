import sequence from '../op/functions/sequence';

/**
 * Create a new Arquero column that proxies access to an
 * Apache Arrow dictionary column.
 * @param {object} vector An Apache Arrow dictionary column.
 */
export default function(vector) {
  const { data, length, nullCount } = vector;
  const dictionary = data[data.length - 1].dictionary;
  const size = dictionary.length;
  const keys = dictKeys(data || [vector], length, nullCount, size);
  const values = Array(size);

  const value = k => k == null || k < 0 || k >= size ? null
    : values[k] !== undefined ? values[k]
    : (values[k] = dictionary.get(k));

  return {
    vector,
    length,

    get: row => value(keys[row]),

    key: row => keys[row],

    keyFor(value) {
      if (value === null) return nullCount ? size : -1;
      for (let i = 0; i < size; ++i) {
        if (values[i] === undefined) values[i] = dictionary.get(i);
        if (values[i] === value) return i;
      }
      return -1;
    },

    groups(names) {
      const s = size + (nullCount ? 1 : 0);
      return { keys, get: [value], names, rows: sequence(0, s), size: s };
    },

    [Symbol.iterator]() {
      return vector[Symbol.iterator]();
    }
  };
}

/**
 * Generate a dictionary key array
 * @param {object[]} chunks Arrow column chunks
 * @param {number} length The length of the Arrow column
 * @param {number} nulls The count of column null values
 * @param {number} size The backing dictionary size
 */
function dictKeys(chunks, length, nulls, size) {
  const v = chunks.length > 1 || nulls
    ? flatten(chunks, length, chunks[0].type.indices)
    : chunks[0].values;
  return nulls ? nullKeys(chunks, v, size) : v;
}

/**
 * Flatten Arrow column chunks into a single array.
 */
function flatten(chunks, length, type) {
  const array = new type.ArrayType(length);
  const n = chunks.length;
  for (let i = 0, idx = 0, len; i < n; ++i) {
    len = chunks[i].length;
    array.set(chunks[i].values.subarray(0, len), idx);
    idx += len;
  }
  return array;
}

/**
 * Encode null values as an additional dictionary key.
 * Returns a new key array with null values added.
 * TODO: safeguard against integer overflow?
 */
function nullKeys(chunks, keys, key) {
  // iterate over null bitmaps, encode null values as key
  const n = chunks.length;
  for (let i = 0, idx = 0, m, base, bits, byte; i < n; ++i) {
    bits = chunks[i].nullBitmap;
    m = chunks[i].length >> 3;
    if (bits && bits.length) {
      for (let j = 0; j <= m; ++j) {
        if ((byte = bits[j]) !== 255) {
          base = idx + (j << 3);
          if ((byte & (1 << 0)) === 0) keys[base + 0] = key;
          if ((byte & (1 << 1)) === 0) keys[base + 1] = key;
          if ((byte & (1 << 2)) === 0) keys[base + 2] = key;
          if ((byte & (1 << 3)) === 0) keys[base + 3] = key;
          if ((byte & (1 << 4)) === 0) keys[base + 4] = key;
          if ((byte & (1 << 5)) === 0) keys[base + 5] = key;
          if ((byte & (1 << 6)) === 0) keys[base + 6] = key;
          if ((byte & (1 << 7)) === 0) keys[base + 7] = key;
        }
      }
    }
    idx += chunks[i].length;
  }
  return keys;
}
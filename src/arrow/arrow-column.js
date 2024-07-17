import sequence from '../op/functions/sequence.js';
import error from '../util/error.js';
import isFunction from '../util/is-function.js';
import repeat from '../util/repeat.js';
import toString from '../util/to-string.js';
import unroll from '../util/unroll.js';

// Hardwire Arrow type ids to sidestep hard dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts
const isDict = ({ typeId }) => typeId === -1;
const isInt = ({ typeId }) => typeId === 2;
const isUtf8 = ({ typeId }) => typeId === 5;
const isDecimal = ({ typeId }) => typeId === 7;
const isDate = ({ typeId }) => typeId === 8;
const isTimestamp = ({ typeId }) => typeId === 10;
const isStruct = ({ typeId }) => typeId === 13;
const isLargeUtf8 = ({ typeId }) => typeId === 20;
const isListType = ({ typeId }) => typeId === 12 || typeId === 16;

/**
 * Create an Arquero column that proxies access to an Arrow column.
 * @param {import('apache-arrow').Vector} vector An Apache Arrow column.
 * @param {import('./types.js').ArrowColumnOptions} [options]
 *  Arrow conversion options.
 * @return {import('../table/types.js').ColumnType}
 *  An Arquero-compatible column.
 */
export default function arrowColumn(vector, options) {
  return isDict(vector.type)
    ? dictionaryColumn(vector)
    : proxyColumn(vector, options);
}

/**
 * Internal method for Arquero column generation for Apache Arrow data
 * @param {import('apache-arrow').Vector} vector An Apache Arrow column.
 * @param {import('./types.js').ArrowColumnOptions} [options]
 *  Arrow conversion options.
 * @return {import('../table/types.js').ColumnType}
 *  An Arquero-compatible column.
 */
function proxyColumn(vector, options = {}) {
  const { type, length, numChildren } = vector;
  const {
    convertDate = true,
    convertDecimal = true,
    convertTimestamp = true,
    convertBigInt = false,
    memoize = true
  } = options;

  // create a getter method for retrieving values
  let get;
  if (numChildren) {
    // extract lists/structs to JS objects, possibly memoized
    get = getNested(vector, options);
    if (memoize) get = memoized(length, get);
  } else if (memoize && (isUtf8(type) || isLargeUtf8(type))) {
    // memoize string extraction
    get = memoized(length, row => vector.get(row));
  } else if ((convertDate && isDate(type))
      || (convertTimestamp && isTimestamp(type))) {
    // convert to Date type, memoized for object equality
    get = memoized(length, row => {
      const v = vector.get(row);
      return v == null ? null : new Date(vector.get(row));
    });
  } else if (convertDecimal && isDecimal(type)) {
    // map decimal to number
    const scale = 1 / Math.pow(10, type.scale);
    get = row => {
      const v = vector.get(row);
      return v == null ? null : decimalToNumber(v, scale);
    };
  } else if (convertBigInt && isInt(type) && type.bitWidth >= 64) {
    // map bigint to number
    get = row => {
      const v = vector.get(row);
      return v == null ? null : Number(v);
    };
  } else if (!isFunction(vector.at)) {
    // backwards compatibility with older arrow versions
    // the vector `at` method was added in Arrow v16
    get = row => vector.get(row);
  } else {
    // use the arrow column directly
    return vector;
  }

  // return a column proxy object using custom getter
  return {
    length,
    at: get,
    [Symbol.iterator]: () => (function* () {
      for (let i = 0; i < length; ++i) {
        yield get(i);
      }
    })()
  };
}

/**
 * Memoize expensive getter calls by caching retrieved values.
 */
function memoized(length, get) {
  const values = Array(length);
  return row => {
    const v = values[row];
    return v !== undefined ? v : (values[row] = get(row));
  };
}

// generate base values for big integers represented as a Uint32Array
const BASE32 = Array.from(
  { length: 8 },
  (_, i) => Math.pow(2, i * 32)
);

/**
 * Convert a fixed point decimal value to a double precision number.
 * Note: if the value is sufficiently large the conversion may be lossy!
 * @param {Uint32Array & { signed: boolean }} v a fixed point decimal value
 * @param {number} scale a scale factor, corresponding to the
 *  number of fractional decimal digits in the fixed point value
 * @return {number} the resulting number
 */
function decimalToNumber(v, scale) {
  const n = v.length;
  let x = 0;
  if (v.signed && (v[n - 1] | 0) < 0) {
    for (let i = 0; i < n; ++i) {
      x += ~v[i] * BASE32[i];
    }
    x = -(x + 1);
  } else {
    for (let i = 0; i < n; ++i) {
      x += v[i] * BASE32[i];
    }
  }
  return x * scale;
}

// get an array for a given vector
function arrayFrom(vector, options) {
  return vector.numChildren ? repeat(vector.length, getNested(vector, options))
    : vector.nullCount ? [...vector]
    : vector.toArray();
}

// generate a getter for a nested data type
function getNested(vector, options) {
  return isListType(vector.type) ? getList(vector, options)
    : isStruct(vector.type) ? getStruct(vector, options)
    : error(`Unsupported Arrow type: ${toString(vector.VectorName)}`);
}

// generate a getter for a list data type
function getList(vector, options) {
  return vector.nullCount
    ? row => vector.isValid(row)
      ? arrayFrom(vector.get(row), options)
      : null
    : row => arrayFrom(vector.get(row), options);
}

// generate a getter for a struct (object) data type
function getStruct(vector, options) {
  // disable memoization for nested columns as we extract JS objects
  const opt = { ...options, memoize: false };
  const props = [];
  const code = [];
  vector.type.children.forEach((field, i) => {
    props.push(arrowColumn(vector.getChildAt(i), opt));
    code.push(`${toString(field.name)}:_${i}.at(row)`);
  });
  const get = unroll('row', '({' + code + '})', props);

  return vector.nullCount
    ? row => vector.isValid(row) ? get(row) : null
    : get;
}

/**
 * Create a new Arquero column that proxies access to an
 * Apache Arrow dictionary column.
 * @param {import('apache-arrow').Vector} vector
 *  An Apache Arrow dictionary column.
 */
function dictionaryColumn(vector) {
  const { data, length, nullCount } = vector;
  const dictionary = data[data.length - 1].dictionary;
  const size = dictionary.length;
  const keys = dictKeys(data || [vector], length, nullCount, size);
  const get = memoized(size,
    k => k == null || k < 0 || k >= size ? null : dictionary.get(k)
  );

  return {
    vector,
    length,
    at: row => get(keys[row]),
    key: row => keys[row],
    keyFor(value) {
      if (value === null) return nullCount ? size : -1;
      for (let i = 0; i < size; ++i) {
        if (get(i) === value) return i;
      }
      return -1;
    },
    groups(names) {
      const s = size + (nullCount ? 1 : 0);
      return { keys, get: [get], names, rows: sequence(0, s), size: s };
    },
    [Symbol.iterator]() {
      return vector[Symbol.iterator]();
    }
  };
}

/**
 * Generate a dictionary key array.
 * @param {readonly any[]} chunks Arrow column chunks
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

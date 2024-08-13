import { tableFromIPC } from '@uwdata/flechette';
import resolve, { all } from '../helpers/selection.js';
import { columnSet } from '../table/ColumnSet.js';
import { ColumnTable } from '../table/ColumnTable.js';
import sequence from '../op/functions/sequence.js';

/** @type {import('./types.js').ArrowOptions} */
const USE_DATE = { useDate: true };

/**
 * Create a new table backed by an Apache Arrow table instance.
 * @param {import('./types.js').ArrowInput} input
 *  An Apache Arrow data table or Arrow IPC byte buffer.
 * @param {import('./types.js').ArrowOptions} [options]
 *  Options for Arrow import.
 * @return {ColumnTable} A new table containing the imported values.
 */
export default function(input, options) {
  const { columns = all(), ...extractOptions } = options || USE_DATE;
  const arrow = input instanceof ArrayBuffer || input instanceof Uint8Array
    ? tableFromIPC(input, extractOptions)
    : input;

  const { fields } = arrow.schema;

  // resolve column selection
  const names = fields.map(f => f.name);
  const sel = resolve({
    columnNames: test => test ? names.filter(test) : names.slice(),
    columnIndex: name => names.indexOf(name)
  }, columns);

  // build Arquero columns for backing Arrow columns
  const cols = columnSet();
  sel.forEach((name, key) => {
    const col = arrow.getChild(key);
    cols.add(name, col.type.typeId === -1 ? dictionary(col) : col);
  });

  return new ColumnTable(cols.data, cols.names);
}

function dictionary(column) {
  const { data, length, nullCount } = column;
  const batch = data[data.length - 1];
  // support both flechette and arrow-js
  const cache = batch.cache ?? batch.dictionary.toArray();
  const size = cache.length;
  const keys = dictKeys(data, length, nullCount, size);

  const get = nullCount
    ? (k => k === size ? null : cache[k])
    : (k => cache[k]);

  return {
    length,
    nullCount,
    at: row => get(keys[row]),
    key: row => keys[row],
    keyFor(value) {
      if (value === null) return nullCount ? size : -1;
      for (let i = 0; i < size; ++i) {
        if (cache[i] === value) return i;
      }
      return -1;
    },
    groups(names) {
      const s = size + (nullCount ? 1 : 0);
      return {
        keys,
        get: [get],
        names,
        rows: sequence(0, s),
        size: s
      };
    },
    [Symbol.iterator]: () => column[Symbol.iterator](),
    toArray: () => column.toArray()
  };
}

/**
 * Generate a dictionary key array.
 * @param {readonly any[]} data Arrow column batches
 * @param {number} length The length of the Arrow column
 * @param {number} nulls The count of column null values
 * @param {number} size The backing dictionary size
 */
function dictKeys(data, length, nulls, size) {
  const v = data.length > 1 || nulls
    ? flatten(data, length)
    : data[0].values;
  return nulls ? nullKeys(data, v, size) : v;
}

/**
 * Flatten Arrow column chunks into a single array.
 */
function flatten(data, length) {
  const type = data[0].values.constructor;
  const array = new type(length);
  const n = data.length;
  for (let i = 0, idx = 0, len; i < n; ++i) {
    len = data[i].length;
    array.set(data[i].values.subarray(0, len), idx);
    idx += len;
  }
  return array;
}

/**
 * Encode null values as an additional dictionary key.
 * Returns a new key array with null values added.
 * TODO: safeguard against integer overflow?
 */
function nullKeys(data, keys, key) {
  // iterate over null bitmaps, encode null values as key
  const n = data.length;
  for (let i = 0, idx = 0, byte; i < n; ++i) {
    const batch = data[i];
    const { length } = batch;
    // support both flechette and arrow-js
    const validity = batch.validity ?? batch.nullBitmap;
    const m = length >> 3;
    if (validity && validity.length) {
      for (let j = 0; j <= m; ++j) {
        if ((byte = validity[j]) !== 255) {
          const base = idx + (j << 3);
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
    idx += length;
  }
  return keys;
}

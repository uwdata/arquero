import resolve, { all } from '../helpers/selection';
import { dictionaryColumn } from '../table/dictionary-column';
import ColumnTable from '../table/column-table';
import error from '../util/error';
import toString from '../util/to-string';
import unroll from '../util/unroll';

// Hardwire Arrow type ids to avoid explicit dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts
export const LIST = 12;
export const STRUCT = 13;
export const FIXED_SIZE_LIST = 16;

function isList(id) {
  return id === LIST || id === FIXED_SIZE_LIST;
}

function isStruct(id) {
  return id === STRUCT;
}

/**
 * Options for Apache Arrow import.
 * @typedef {object} ArrowOptions
 * @property {import('../table/transformable').Select} columns
 *  An ordered set of columns to import. The input may consist of column name
 *  strings, column integer indices, objects with current column names as keys
 *  and new column names as values (for renaming), or selection helper
 *  functions such as {@link all}, {@link not}, or {@link range}.
 * @property {boolean} [unpack=false] Flag to unpack binary-encoded Arrow
 *  data to standard JavaScript values. Unpacking can incur an upfront time
 *  and memory cost to extract data to new arrays, but can speed up later
 *  query processing by enabling faster data access.
 */

/**
 * Create a new table backed by an Apache Arrow table instance.
 * @param {object} arrowTable An Apache Arrow data table.
 * @param {ArrowOptions} options Options for Arrow import.
 * @param {ColumnTable} table A new table containing the imported values.
 */
export default function(arrowTable, options = {}) {
  const { names, cols } = resolveColumns(arrowTable, options.columns);
  const count = arrowTable.count();

  const data = arrowTable.length === count
    ? collect(names, cols, !!options.unpack)
    : collectFiltered(arrowTable, names, cols, count);

  return new ColumnTable(data, names);
}

function resolveColumns(arrowTable, selection) {
  const fields = arrowTable.schema.fields.map(f => f.name);
  const map = resolve({
    columnNames: filter => filter ? fields.filter(filter) : fields.slice(),
    columnIndex: name => fields.indexOf(name)
  }, selection || all());

  const names = [];
  const cols = [];

  map.forEach((name, key) => {
    names.push(name);
    cols.push(arrowTable.getColumn(key));
  });

  return { names, cols };
}

function collect(names, cols, unpack) {
  const data = {};

  cols.forEach((col, idx) =>
    data[names[idx]] = col.numChildren ? arrayFromNested(col)
      : col.dictionary ? dictionaryColumn(col)
      : unpack ? arrayFromVector(col)
      : col
  );

  return data;
}

function collectFiltered(input, names, cols, count) {
  const data = {};
  const out = cols.map((col, idx) => data[names[idx]] = newArray(col, count));
  const lut = cols.map(col => col.dictionary ? dictionaryLookup(col) : null);

  let row = -1;
  let batch = -1;
  let collect;

  input.scan(
    idx => collect(++row, idx),
    () => {
      ++batch;
      collect = unroll(
        ['row', 'idx'],
        '{' + out.map((_, i) => `_${i}[row]=$${i}(idx)`).join(';') + ';}',
        out,
        cols.map((col, i) => extractFrom(col.chunks[batch], lut[i]))
      );
    }
  );

  return data;
}

// Typed Arrays can be used for the following Arrow types:
//  Int = 2; Float = 3; Decimal = 7; Time = 9; Timestamp = 10;
function newArray(col, count) {
  if (!col.nullCount) {
    const { ArrayType, typeId: id } = col;
    if (id === 2 || id === 3 || id === 7 || id === 9 || id === 10) {
      return new ArrayType(count);
    }
  }

  return Array(count);
}

// extraction function for input vector
// If dictionary type, lookup function must be provided
function extractFrom(vector, lookup) {
  return vector.numChildren ? extractFromNested(vector)
    : vector.dictionary ? extractFromDictionary(vector, lookup)
    : idx => vector.get(idx);
}

// extraction function for nested column types
function extractFromNested(vector) {
  const extract = isList(vector.typeId) ? i => arrayExtractor(vector.get(i))
    : isStruct(vector.typeId) ? structExtractor(vector)
    : error(`Unsupported Arrow type: ${toString(vector.VectorName)}`);
  return idx => vector.isValid(idx) ? extract(idx) : null;
}

// extraction function for dictionary-encoded values
// For null bitmaps:
//  j >> 3 advances the byte every 8 bits;
//  (1 << (j & 7) checks if the relevant bit is set in that byte
function extractFromDictionary(vector, lookup) {
  const { nullBitmap: nulls, data: { values: keys } } = vector;
  return nulls && nulls.length
    ? i => (nulls[i >> 3] & (1 << (i & 7))) ? lookup(keys[i]) : null
    : i => lookup(keys[i]);
}

// decode utf-8 only once per dictionary key
// use the last chunk in case the dictionary builds as it goes
// perform lazy extraction to avoid processing unused entries
function dictionaryLookup(chunked) {
  const chunk = chunked.chunks[chunked.chunks.length - 1];
  const dict = chunk.dictionary;
  const values = [];
  return key => {
    const v = values[key];
    return v === undefined ? (values[key] = dict.get(key)) : v;
  };
}

// extract from an array-typed vector, recurse if nested.
function arrayExtractor(vector) {
  return vector.numChildren
    ? arrayFromNested(vector)
    : arrayFromVector(vector);
}

// extract struct field names and values
// return function to generate objects with field name properties
function structExtractor(vector) {
  const names = vector.type.children.map(field => field.name);
  const values = names.map((_, i) => arrayExtractor(vector.getChildAt(i)));
  return unroll(
    'i',
    '({' + names.map((_, d) => `${toString(_)}:_${d}[i]`) + '})',
    values
  );
}

// generate and return objects for each nested value
function arrayFromNested(vector) {
  const extract = extractFromNested(vector);
  return Array.from({ length: vector.length }, (_, i) => extract(i));
}

// if dictionary column, perform more efficient extraction
// if has null values, extract to standard array
// otherwise, let Arrow try to use copy-less subarray call
function arrayFromVector(vector) {
  return vector.dictionary ? arrayFromDictionary(vector)
    : vector.nullCount > 0 ? [...vector]
    : vector.toArray();
}

// produce array of decoded dictionary values
function arrayFromDictionary(vector) {
  const lookup = dictionaryLookup(vector);
  const array = Array(vector.length);
  let row = -1;
  for (const chunk of vector.chunks) {
    const extract = extractFromDictionary(chunk, lookup);
    const len = chunk.length;
    for (let idx = 0; idx < len; ++idx) {
      array[++row] = extract(idx);
    }
  }
  return array;
}
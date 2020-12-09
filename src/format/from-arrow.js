import ColumnTable from '../table/column-table';
import error from '../util/error';
import toString from '../util/to-string';
import unroll from '../util/unroll';

// Hardwire Arrow type ids to avoid explicit dependency
// https://github.com/apache/arrow/blob/master/js/src/enum.ts
export const LIST = 12;
export const STRUCT = 13;

/**
 * Options for Apache Arrow import.
 * @typedef {Object} ArrowOptions
 * @property {string[]} [columns] Ordered list of column names to import.
 * @property {boolean} [unpack=false] Flag to unpack binary-encoded Arrow
 *  data to standard JavaScript values. Unpacking can incur an upfront time
 *  and memory cost to extract data to new arrays, but can speed up later
 *  query processing by enabling faster data access.
 */

/**
 * Create a new table backed by an Apache Arrow table instance.
 * @param {Object} arrowTable An Apache Arrow data table.
 * @param {ArrowOptions} options Options for Arrow import.
 * @param {ColumnTable} table A new table containing the imported values.
 */
export default function(arrowTable, options = {}) {
  const columns = {};

  const names = options.columns || arrowTable.schema.fields.map(f => f.name);
  const unpack = !!options.unpack;

  names.forEach(name => {
    const column = arrowTable.getColumn(name);
    if (column == null) {
      error(`Arrow column does not exist: ${toString(name)}`);
    }
    columns[name] = column.numChildren ? arrayFromNested(column)
      : unpack ? arrayFromVector(column)
      : column;
  });

  return new ColumnTable(columns);
}

function arrayFromNested(vector) {
  const extract = vector.typeId === LIST ? i => arrayExtractor(vector.get(i))
    : vector.typeId === STRUCT ? structExtractor(vector)
    : error(`Unsupported Arrow type: ${toString(vector.VectorName)}`);

  // generate and return objects for each nested value
  return Array.from(
    { length: vector.length },
    (_, i) => vector.isValid(i) ? extract(i) : null
  );
}

function arrayExtractor(vector) {
  // extract an array, recurse if nested.
  return vector.numChildren
    ? arrayFromNested(vector)
    : arrayFromVector(vector);
}

function structExtractor(vector) {
  // extract struct field names and values
  const names = vector.type.children.map(field => field.name);
  const values = names.map((_, i) => arrayExtractor(vector.getChildAt(i)));

  // function to generate objects with field name properties
  return unroll(
    values, 'i',
    '({' + names.map((_, d) => `${toString(_)}:_${d}[i]`) + '})'
  );
}

function arrayFromVector(column) {
  // if dictionary column, perform more efficient extraction
  // if has null values, extract to standard array
  // otherwise, let Arrow try to use copy-less subarray call
  return column.dictionary ? arrayFromDictionary(column)
    : column.nullCount > 0 ? [...column]
    : column.toArray();
}

function arrayFromDictionary(column) {
  // decode utf-8 only once per dictionary key
  // use the last chunk in case the dictionary builds as it goes
  const chunks = column.chunks;
  const dict = chunks[chunks.length - 1].dictionary.toArray();
  const array = new Array(column.length);

  // populate array values
  let i = -1;
  for (const chunk of chunks) {
    const { nullBitmap: nulls, data: { values, length: m } } = chunk;
    if (nulls && nulls.length) {
      for (let j = 0; j < m; ++j) {
        // j >> 3 advances the byte every 8 bits;
        // (1 << (j & 7) checks if the relevant bit is set in that byte
        array[++i] = !(nulls[j >> 3] & (1 << (j & 7)))
          ? null
          : dict[values[j]];
      }
    } else {
      for (let j = 0; j < m; ++j) {
        array[++i] = dict[values[j]];
      }
    }
  }

  return array;
}
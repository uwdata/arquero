import ColumnTable from '../table/column-table';
import error from '../util/error';

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
      error(`Arrow column does not exist: ${JSON.stringify(name)}`);
    }
    columns[name] = unpack ? arrayFromArrow(column) : column;
  });

  return new ColumnTable(columns);
}

function arrayFromArrow(column) {
  // if has null values, extract to standard array
  return column.nullCount > 0 ? [...column] : column.toArray();
}
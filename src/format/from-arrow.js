import ColumnTable from '../table/column-table';
import error from '../util/error';

/**
 * Options for Apache Arrow import.
 * @typedef {Object} ArrowOptions
 * @property {string[]} [columns] Ordered list of column names to import.
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
  names.forEach(name => {
    const column = arrowTable.getColumn(name);
    if (column == null) {
      error(`Arrow column does not exist: ${JSON.stringify(name)}`);
    }
    columns[name] = column;
  });

  return new ColumnTable(columns);
}
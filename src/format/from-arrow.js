import { fromIPC } from '../arrow/arrow-table';
import arrowColumn from '../arrow/arrow-column';
import resolve, { all } from '../helpers/selection';
import columnSet from '../table/column-set';
import ColumnTable from '../table/column-table';

/**
 * Options for Apache Arrow import.
 * @typedef {object} ArrowOptions
 * @property {import('../table/transformable').Select} columns
 *  An ordered set of columns to import. The input may consist of column name
 *  strings, column integer indices, objects with current column names as keys
 *  and new column names as values (for renaming), or selection helper
 *  functions such as {@link all}, {@link not}, or {@link range}.
 */

/**
 * Create a new table backed by an Apache Arrow table instance.
 * @param {object} arrow An Apache Arrow data table or byte buffer.
 * @param {ArrowOptions} options Options for Arrow import.
 * @return {ColumnTable} A new table containing the imported values.
 */
export default function(arrow, options = {}) {
  if (arrow && !arrow.batches) {
    arrow = fromIPC()(arrow);
  }

  // resolve column selection
  const fields = arrow.schema.fields.map(f => f.name);
  const sel = resolve({
    columnNames: test => test ? fields.filter(test) : fields.slice(),
    columnIndex: name => fields.indexOf(name)
  }, options.columns || all());

  // build Arquero columns for backing Arrow columns
  const cols = columnSet();
  sel.forEach((name, key) => {
    cols.add(name, arrowColumn(arrow.getChild(key)));
  });

  return new ColumnTable(cols.data, cols.names);
}
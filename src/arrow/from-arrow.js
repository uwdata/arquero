import { arrowTableFromIPC } from './arrow-table.js';
import arrowColumn from './arrow-column.js';
import resolve, { all } from '../helpers/selection.js';
import { columnSet } from '../table/ColumnSet.js';
import { ColumnTable } from '../table/ColumnTable.js';

/**
 * Create a new table backed by an Apache Arrow table instance.
 * @param {import('./types.js').ArrowInput} arrow
 *  An Apache Arrow data table or Arrow IPC byte buffer.
 * @param {import('./types.js').ArrowOptions} [options]
 *  Options for Arrow import.
 * @return {ColumnTable} A new table containing the imported values.
 */
export default function(arrow, options) {
  if (arrow instanceof ArrayBuffer || ArrayBuffer.isView(arrow)) {
    arrow = arrowTableFromIPC(arrow);
  }

  const {
    columns = all(),
    ...columnOptions
  } = options || {};

  // resolve column selection
  const fields = arrow.schema.fields.map(f => f.name);
  const sel = resolve({
    columnNames: test => test ? fields.filter(test) : fields.slice(),
    columnIndex: name => fields.indexOf(name)
  }, columns);

  // build Arquero columns for backing Arrow columns
  const cols = columnSet();
  sel.forEach((name, key) => {
    cols.add(name, arrowColumn(arrow.getChild(key), columnOptions));
  });

  return new ColumnTable(cols.data, cols.names);
}

import { columns, numRows } from './util';

/**
 * Options for JSON formatting.
 * @typedef {Object} JSONFormatOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]|Function} [columns] Ordered list of column names
 *  to include. If function-valued, the function should accept a table as
 *  input and return an array of column name strings.
 */

/**
 * Format a table as a JavaScript Object Notation (JSON) string.
 * @param {ColumnTable} table The table to format.
 * @param {JSONFormatOptions} options The formatting options.
 * @return {string} A JSON string.
 */
export default function(table, options = {}) {
  const limit = numRows(table, options.limit);
  const names = columns(table, options.columns);
  let text = '{';

  names.forEach((name, i) => {
    text += (i ? ',' : '') + JSON.stringify(name) + ':[';

    const column = table.column(name);
    if (limit > 0) {
      let r = 0;
      table.scan((row, data, stop) => {
        text += (r ? ',' : '') + JSON.stringify(column.get(row));
        if (++r >= limit) stop();
      });
    }

    text += ']';
  });

  return text + '}';
}
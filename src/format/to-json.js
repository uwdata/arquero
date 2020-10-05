import { columns, numRows } from './util';

/**
 * Options for JSON formatting.
 * @typedef {Object} JSONFormatOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]|Function} [columns] Ordered list of column names
 *  to include. If function-valued, the function should accept a table as
 *  input and return an array of column name strings.
* @property {Object} [format] Object of column format options.
 *  The object keys should be column names. The object values should be
 *  formatting functions to invoke to transform column values prior to output.
 *  If specified, these override any automatically inferred options.
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
  const format = options.format || {};
  let text = '{';

  names.forEach((name, i) => {
    text += (i ? ',' : '') + JSON.stringify(name) + ':[';

    const column = table.column(name);
    if (limit > 0) {
      let r = 0;
      const formatter = format[name] || (d => d);
      table.scan((row, data, stop) => {
        const value = column.get(row);
        text += (r ? ',' : '') + JSON.stringify(formatter(value));
        if (++r >= limit) stop();
      }, true);
    }

    text += ']';
  });

  return text + '}';
}
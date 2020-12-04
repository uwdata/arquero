import { columns } from './util';
import { formatUTCDate } from '../util/format-date';
import isDate from '../util/is-date';

/**
 * Options for JSON formatting.
 * @typedef {Object} JSONFormatOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {number} [offset=0] The row offset indicating how many initial rows to skip.
 * @property {string[]|Function} [columns] Ordered list of column names
 *  to include. If function-valued, the function should accept a table as
 *  input and return an array of column name strings.
 * @property {Object} [format] Object of column format options. The object
 *  keys should be column names. The object values should be formatting
 *  functions to invoke to transform column values prior to output. If
 *  specified, these override any automatically inferred options.
 */

const defaultFormatter = value => isDate(value)
  ? formatUTCDate(value, true)
  : value;

/**
 * Format a table as a JavaScript Object Notation (JSON) string.
 * @param {ColumnTable} table The table to format.
 * @param {JSONFormatOptions} options The formatting options.
 * @return {string} A JSON string.
 */
export default function(table, options = {}) {
  const format = options.format || {};
  const names = columns(table, options.columns);
  let text = '{';

  names.forEach((name, i) => {
    text += (i ? ',' : '') + JSON.stringify(name) + ':[';

    const column = table.column(name);
    const formatter = format[name] || defaultFormatter;
    let r = -1;
    table.scan(row => {
      const value = column.get(row);
      text += (++r ? ',' : '') + JSON.stringify(formatter(value));
    }, true, options.limit, options.offset);

    text += ']';
  });

  return text + '}';
}
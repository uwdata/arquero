import { columns, scan } from './util';
import { dsvFormat } from 'd3-dsv';

/**
 * Options for CSV formatting.
 * @typedef {Object} CSVFormatOptions
 * @property {string} [delimiter=','] The delimiter between values.
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]|Function} [columns] Ordered list of column names
 *  to include. If function-valued, the function should accept a table as
 *  input and return an array of column name strings.
 */

/**
 * Format a table as a comma-separated values (CSV) string. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument.
 * @param {ColumnTable} table The table to format.
 * @param {CSVFormatOptions} options The formatting options.
 * @return {string} A delimited-value format string.
 */
export default function(table, options = {}) {
  const names = columns(table, options.columns);
  const delim = options.delim || ',';
  const dsv = dsvFormat(delim);
  const vals = names.map(dsv.formatValue);
  let text = '';

  scan(table, names, options.limit, {
    row() {
      text += vals.join(delim) + '\n';
    },
    cell(value, name, index) {
      vals[index] = dsv.formatValue(value);
    }
  });

  return text + vals.join(delim);
}
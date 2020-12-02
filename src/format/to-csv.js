import { columns, scan } from './util';
import { formatUTCDate } from '../util/format-date';
import isDate from '../util/is-date';

/**
 * Options for CSV formatting.
 * @typedef {Object} CSVFormatOptions
 * @property {string} [delimiter=','] The delimiter between values.
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {number} [offset=0] The row offset indicating how many initial rows to skip.
 * @property {string[]|Function} [columns] Ordered list of column names
 *  to include. If function-valued, the function should accept a table as
 *  input and return an array of column name strings.
 * @property {Object} [format] Object of column format options.
 *  The object keys should be column names. The object values should be
 *  formatting functions to invoke to transform column values prior to output.
 *  If specified, these override any automatically inferred options.
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
  const format = options.format || {};
  const delim = options.delimiter || ',';
  const reFormat = new RegExp(`["${delim}\n\r]`);

  const formatValue = value => value == null ? ''
    : isDate(value) ? formatUTCDate(value, true)
    : reFormat.test(value += '') ? '"' + value.replace(/"/g, '""') + '"'
    : value;

  const vals = names.map(formatValue);
  let text = '';

  scan(table, names, options.limit, options.offset, {
    row() {
      text += vals.join(delim) + '\n';
    },
    cell(value, name, index) {
      vals[index] = formatValue(format[name] ? format[name](value) : value);
    }
  });

  return text + vals.join(delim);
}
import { columns, scan } from './util';
import pad from '../util/pad';

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
  const reFormat = new RegExp(`["${delim}\n\r]`);

  const formatValue = value => value == null ? ''
    : value instanceof Date ? formatDate(value)
    : reFormat.test(value += '') ? '"' + value.replace(/"/g, '""') + '"'
    : value;

  const vals = names.map(formatValue);
  let text = '';

  scan(table, names, options.limit, {
    row() {
      text += vals.join(delim) + '\n';
    },
    cell(value, name, index) {
      vals[index] = formatValue(value);
    }
  });

  return text + vals.join(delim);
}



const formatYear = year => year < 0 ? '-' + pad(-year, 6)
  : year > 9999 ? '+' + pad(year, 6)
  : pad(year, 4);

const formatDate = date => {
  const hours = date.getUTCHours(),
        min = date.getUTCMinutes(),
        sec = date.getUTCSeconds(),
        ms = date.getUTCMilliseconds();

  return isNaN(date) ? 'Invalid Date'
      : formatYear(date.getUTCFullYear()) + '-'
      + pad(date.getUTCMonth() + 1, 2) + '-'
      + pad(date.getUTCDate(), 2)
      + (
        ms ? 'T' + pad(hours, 2) + ':' + pad(min, 2) + ':' + pad(sec, 2) + '.' + pad(ms, 3) + 'Z'
        : sec ? 'T' + pad(hours, 2) + ':' + pad(min, 2) + ':' + pad(sec, 2) + 'Z'
        : min || hours ? 'T' + pad(hours, 2) + ':' + pad(min, 2) + 'Z'
        : ''
      );
};
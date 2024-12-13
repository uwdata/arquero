import { formatUTCDate } from '../util/format-date.js';
import { isDate } from '../util/is-date.js';
import { columns } from './util/columns.js';
import { scan } from './util/scan.js';

/**
 * Options for CSV formatting.
 * @typedef {object} CSVFormatOptions
 * @property {string} [delimiter=','] The delimiter between values.
 * @property {boolean} [header=true] Flag to specify presence of header row.
 *  If true, includes a header row with column names.
 *  If false, the header is omitted.
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {number} [offset=0] The row offset indicating how many initial rows to skip.
 * @property {import('./types.js').ColumnSelectOptions} [columns] Ordered list
 *  of column names to include. If function-valued, the function should
 *  accept a table as input and return an array of column name strings.
 * @property {Object.<string, (value: any) => any>} [format] Object of column
 *  format options. The object keys should be column names. The object values
 *  should be formatting functions to invoke to transform column values prior
 *  to output. If specified, these override automatically inferred options.
 */

/**
 * Format a table as a comma-separated values (CSV) string. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument.
 * @param {import('../table/Table.js').Table} table The table to format.
 * @param {CSVFormatOptions} options The formatting options.
 * @return {string} A delimited-value format string.
 */
export function toCSV(table, options = {}) {
  const names = columns(table, options.columns);
  const format = options.format || {};
  const delim = options.delimiter || ',';
  const header = options.header ?? true;
  const reFormat = new RegExp(`["${delim}\n\r]`);

  const formatValue = value => value == null ? ''
    : isDate(value) ? formatUTCDate(value, true)
    : reFormat.test(value += '') ? '"' + value.replace(/"/g, '""') + '"'
    : value;

  const vals = names.map(formatValue);
  let text = header ? (vals.join(delim) + '\n') : '';

  scan(table, names, options.limit || Infinity, options.offset, {
    cell(value, name, index) {
      vals[index] = formatValue(format[name] ? format[name](value) : value);
    },
    end() {
      text += vals.join(delim) + '\n';
    }
  });

  return text;
}

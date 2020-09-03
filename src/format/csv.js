import ColumnTable from '../table/column-table';
import { columns, scan } from './util';
import { autoType, dsvFormat } from 'd3-dsv';

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
 * @return {string} A string in a delimited-value format.
 */
export function toCSV(table, options = {}) {
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

/**
 * Options for CSV parsing.
 * @typedef {Object} CSVParseOptions
 * @property {string} [delimiter=','] The delimiter between values.
 */

/**
 * Parse a comma-separated values (CSV) string into a table. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument.
 * @param {CSVParseOptions} options The formatting options.
 * @param {string} text A string in a delimited-value format.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export function fromCSV(text, options = {}) {
  const delim = options.delim || ',';
  const dsv = dsvFormat(delim);
  const values = [];
  let names = [];

  dsv.parseRows(text, (row, index) => {
    if (index === 0) {
      names = row;
      const n = names.length;
      for (let i = 0; i < n; ++i) {
        values[i] = [];
      }
    } else {
      const n = names.length;
      autoType(row);
      for (let i = 0; i < n; ++i) {
        values[i].push(row[i]);
      }
    }
  });

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns);
}
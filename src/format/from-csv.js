import ColumnTable from '../table/column-table';
import autoType from '../util/auto-type';
import parse from '../util/parse-dsv';

/**
 * Options for CSV parsing.
 * @typedef {Object} CSVParseOptions
 * @property {string} [delimiter=','] The delimiter between values.
 */

/**
 * Parse a comma-separated values (CSV) string into a table. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument.
 * @param {string} text A string in a delimited-value format.
 * @param {CSVParseOptions} options The formatting options.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export default function(text, options = {}) {
  const delim = (options.delim == null ? ',' : options.delim + '').charCodeAt(0);
  const values = [];
  let names = [];

  parse(text, delim, (row, index) => {
    if (index === 0) {
      names = row;
      const n = names.length;
      for (let i = 0; i < n; ++i) {
        values[i] = [];
      }
    } else {
      const n = names.length;
      for (let i = 0; i < n; ++i) {
        values[i].push(autoType(row[i]));
      }
    }
  });

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns);
}
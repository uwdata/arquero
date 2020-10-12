import ColumnTable from '../table/column-table';
import autoType from '../util/auto-type';
import isFunction from '../util/is-function';
import parse from '../util/parse-dsv';
import repeat from '../util/repeat';

const DEFAULT_COLUMN_NAME = 'col';

/**
 * Options for CSV parsing.
 * @typedef {Object} CSVParseOptions
 * @property {string} [delimiter=','] The delimiter between values.
 * @property {boolean} [autoType=true] Flag controlling automatic type inference.
 * @property {boolean} [header=true] Flag to specify presence of header row.
 *  If true, assumes the CSV contains a header row with column names.
 *  If false, indicates the CSV does not contain a header row, and the
 *  columns are given the names 'col1', 'col2', and so on.
 * @property {Object} [parse] Object of column parsing options.
 *  The object keys should be column names. The object values should be
 *  parsing functions to invoke to transform values upon input.
 */

/**
 * Parse a comma-separated values (CSV) string into a table. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument. By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {string} text A string in a delimited-value format.
 * @param {CSVParseOptions} options The formatting options.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export default function(text, options = {}) {
  const delimiter = options.delimiter == null ? ',' : options.delimiter;
  const delim = (delimiter + '').charCodeAt(0);
  const defaultParser = options.autoType !== false ? autoType : d => d;
  const header = options.header !== false;
  let names, values, parsers;

  parse(text, delim, (array, index) => {
    if (index === 0) {
      const n = array.length;
      values = repeat(n, () => []);
      parsers = Array(n).fill(defaultParser);

      if (header) {
        const p = options.parse || {};
        (names = array)
          .forEach((_, i) => isFunction(p[_]) ? (parsers[i] = p[_]) : 0);
        return;
      } else {
        names = repeat(n, i => `${DEFAULT_COLUMN_NAME}${i + 1}`);
      }
    }

    const n = names.length;
    for (let i = 0; i < n; ++i) {
      values[i].push(parsers[i](array[i]));
    }
  });

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns);
}
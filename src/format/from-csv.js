import ColumnTable from '../table/column-table';
import autoType from '../util/auto-type';
import isFunction from '../util/is-function';
import parse from '../util/parse-dsv';

/**
 * Options for CSV parsing.
 * @typedef {Object} CSVParseOptions
 * @property {string} [delimiter=','] The delimiter between values.
 * @property {boolean} [autoType=true] Flag controlling automatic type inference.
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
  const delim = (options.delim == null ? ',' : options.delim + '').charCodeAt(0);
  const defaultParser = options.autoType !== false ? autoType : d => d;
  const values = [];
  let names = [];
  let parsers;

  parse(text, delim, (row, index) => {
    if (index === 0) {
      names = row;
      const n = names.length;
      const p = options.parse || {};
      parsers = Array(n);
      for (let i = 0; i < n; ++i) {
        const parser = p[names[i]];
        parsers[i] = isFunction(parser) ? parser : defaultParser;
        values[i] = [];
      }
    } else {
      const n = names.length;
      for (let i = 0; i < n; ++i) {
        values[i].push(parsers[i](row[i]));
      }
    }
  });

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns);
}
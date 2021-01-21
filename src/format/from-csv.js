import ColumnTable from '../table/column-table';
import isFunction from '../util/is-function';
import identity from '../util/identity';
import parseDSV from '../util/parse-dsv';
import valueParser from '../util/parse-values';
import repeat from '../util/repeat';
import error from '../util/error';

const DEFAULT_NAME = 'col';

/**
 * Options for CSV parsing.
 * @typedef {object} CSVParseOptions
 * @property {string} [delimiter=','] Single-character delimiter between values.
 * @property {boolean} [header=true] Flag to specify presence of header row.
 *  If true, assumes the CSV contains a header row with column names.
 *  If false, indicates the CSV does not contain a header row, and the
 *  columns are given the names 'col1', 'col2', and so on.
 * @property {boolean} [autoType=true] Flag for automatic type inference.
 * @property {number} [autoMax=1000] Maximum number of initial values to use
 *  for type inference.
 * @property {Object.<string, (value: string) => any>} [parse] Object of
 *  column parsing options. The object keys should be column names. The object
 *  values should be parsing functions that transform values upon input.
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
  const delim = options.delimiter == null ? ',' : options.delimiter;
  const header = options.header !== false;
  const automax = +options.autoMax || 1000;

  if (delim.length > 1) error('CSV delimiter should be a single character.');
  const rows = parseDSV(text, (delim + '').charCodeAt(0));
  let row = rows.next() || [];

  const n = row.length;
  const values = repeat(n, () => []);
  const names = header ? row : repeat(n, i => `${DEFAULT_NAME}${i + 1}`);

  // read in initial rows to guess types
  let idx = 0;
  row = header ? rows.next() : row;
  for (; idx < automax && row; ++idx, row = rows.next()) {
    for (let i = 0; i < n; ++i) {
      values[i].push(row[i] === '' ? null : row[i]);
    }
  }

  // initialize parsers
  const parsers = options.autoType === false
    ? Array(n).fill(identity)
    : getParsers(names, values, options.parse);

  // apply parsers
  parsers.forEach((parse, i) => {
    if (parse === identity) return;
    const v = values[i];
    for (let r = 0; r < idx; ++r) {
      if (v[r] != null) v[r] = parse(v[r]);
    }
  });

  // parse remainder of file
  for (; row; row = rows.next()) {
    for (let i = 0; i < n; ++i) {
      values[i].push(row[i] === '' ? null : parsers[i](row[i]));
    }
  }

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns, names);
}

function getParsers(names, values, opt = {}) {
  return names.map(
    (name, i) => isFunction(opt[name]) ? opt[name] : valueParser(values[i])
  );
}
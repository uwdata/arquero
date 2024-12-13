import { ColumnTable } from '../table/ColumnTable.js';
import { error } from '../util/error.js';
import { isString } from '../util/is-string.js';
import { DelimitedTextStream } from './stream/delimited-text-stream.js';
import { lineFilter } from './stream/line-filter-stream.js';
import { parseTextRows } from './stream/parse-text-rows.js';
import { pipeline } from './stream/pipeline.js';
import { textStream } from './stream/text-stream.js';
import { toTextStream } from './stream/to-text-stream.js';

/**
 * Options for CSV parsing.
 * @typedef {object} CSVParseOptions
 * @property {string} [delimiter=','] Single-character delimiter between values.
 * @property {string} [decimal='.'] Single-character numeric decimal separator.
 * @property {boolean} [header=true] Flag to specify presence of header row.
 *  If true, assumes the CSV contains a header row with column names. If false,
 *  indicates the CSV does not contain a header row; columns are given the
 *  names 'col1', 'col2', etc unless the *names* option is specified.
 * @property {string[]} [names] An array of column names to use for header-less
 *  CSV files. This option is ignored if the header option is true.
 * @property {number} [skip=0] The number of lines to skip before reading data.
 * @property {string} [comment] A string used to identify comment lines. Any
 *  lines that start with the comment pattern are skipped.
 * @property {boolean} [autoType=true] Flag for automatic type inference.
 * @property {number} [autoMax=1000] Maximum number of initial values to use
 *  for type inference.
 * @property {Record<string, (value: string) => any>} [parse] Object of
 *  column parsing options. The object keys should be column names. The object
 *  values should be parsing functions that transform values upon input.
 */

/**
 * Load a CSV file from a URL and return a Promise for an Arquero table.
 * @param {string} path The URL or file path to load.
 * @param {import('./types.js').LoadOptions & CSVParseOptions} [options]
 *  CSV parse options.
 * @return {Promise<ColumnTable>} A Promise to an Arquero table.
 * @example aq.loadCSV('data/table.csv')
 * @example aq.loadTSV('data/table.tsv', { delimiter: '\t' })
 */
export async function loadCSV(path, options) {
 return parseCSV(await textStream(path, options), options);
}

/**
 * Parse a comma-separated values (CSV) string into a table. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument. By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {ReadableStream<string> | string} input The input text or stream.
 * @param {CSVParseOptions} [options] The formatting options.
 * @return {Promise<ColumnTable>} A Promise to an Arquero table.
 */
export async function parseCSV(input, options) {
  const stream = isString(input) ? toTextStream(input)
    : input instanceof ReadableStream ? input
    : error('parseCSV input must be a string or ReadableStream');
  const { columns, names } = await streamCSV(stream, options);
  return new ColumnTable(columns, names);
}

function streamCSV(input, {
  delimiter = ',',
  skip = 0,
  comment = undefined,
  ...options
} = {}) {
  return parseTextRows(
    pipeline(input, [
      new DelimitedTextStream(delimiter),
      lineFilter(skip, comment, row => row[0])
    ]),
    options
  );
}

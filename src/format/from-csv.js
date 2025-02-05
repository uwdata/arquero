import { ColumnTable } from '../table/ColumnTable.js'; // eslint-disable-line no-unused-vars
import { delimitedTextTransformer } from './stream/delimited-text-stream.js';
import { lineFilterTransformer } from './stream/line-filter-stream.js';
import { parseTextRowsStream, parseTextRowsSync } from './stream/parse-text-rows.js';
import { textStream } from './stream/text-stream.js';

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
 * Parse a comma-separated values (CSV) string into a table. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument. By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {string} input The input text.
 * @param {CSVParseOptions} [options] The formatting options.
 * @return {ColumnTable} An Arquero table.
 */
export function fromCSV(input, options) {
  return parseTextRowsSync(input, transforms(options), options);
}

/**
 * Parse a comma-separated values (CSV) string into a table. Other
 * delimiters, such as tabs or pipes ('|'), can be specified using
 * the options argument. By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {ReadableStream<string>} stream The input stream.
 * @param {CSVParseOptions} [options] The formatting options.
 * @return {Promise<ColumnTable>} A Promise to an Arquero table.
 */
export async function fromCSVStream(stream, options) {
  return parseTextRowsStream(stream, transforms(options), options);
}

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
  return fromCSVStream(await textStream(path, options), options);
}

function transforms({
  delimiter = ',',
  skip = 0,
  comment = undefined
} = {}) {
  return [
    delimitedTextTransformer(delimiter),
    lineFilterTransformer(skip, comment, row => row[0])
  ];
}

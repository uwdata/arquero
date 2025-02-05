import { ColumnTable } from '../table/ColumnTable.js'; // eslint-disable-line no-unused-vars
import { error } from '../util/error.js';
import { fixedTextTransformer } from './stream/fixed-text-stream.js';
import { lineFilterTransformer } from './stream/line-filter-stream.js';
import { textLineTransformer } from './stream/text-line-stream.js';
import { parseTextRowsStream, parseTextRowsSync } from './stream/parse-text-rows.js';
import { textStream } from './stream/text-stream.js';

/**
 * Options for fixed width file parsing.
 * @typedef {object} FixedParseOptions
 * @property {[number, number][]} [positions] Array of start, end indices for
 *  fixed-width columns. Specifying extact positions supports extraction of
 *  a selected subset of columns.
 * @property {number[]} [widths] Array of fixed column widths. This option is
 *  ignored if the positions property is specified.
 * @property {string[]} [names] An array of column names. The array length
 *  should match the length of the positions array. If not specified or
 *  shorter than the positions array, default column names are generated.
 * @property {string} [decimal='.'] Single-character numeric decimal separator.
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
 * Parse a fixed-width file (FWF) string into a table. By default, automatic
 * type inference is performed for input values; string values that match the
 * ISO standard date format are parsed into JavaScript Date objects. To
 * disable this behavior, set the autoType option to false. To perform custom
 * parsing of input column values, use the parse option.
 * @param {string} input The input text.
 * @param {FixedParseOptions} [options] The formatting options.
 * @return {ColumnTable} An Arquero table.
 */
export function fromFixed(input, options) {
  return parseTextRowsSync(
    input,
    transforms(options),
    { ...options, header: false }
  );
}

/**
 * Parse a fixed-width file (FWF) stream into a table. By default, automatic
 * type inference is performed for input values; string values that match the
 * ISO standard date format are parsed into JavaScript Date objects. To
 * disable this behavior, set the autoType option to false. To perform custom
 * parsing of input column values, use the parse option.
 * @param {ReadableStream<string>} stream The input stream.
 * @param {FixedParseOptions} [options] The formatting options.
 * @return {Promise<ColumnTable>} A Promise to an Arquero table.
 */
export async function fromFixedStream(stream, options) {
  return parseTextRowsStream(
    stream,
    transforms(options),
    { ...options, header: false }
  );
}

/**
 * Load a fixed width file from a URL and return a Promise for an Arquero table.
 * @param {string} path The URL or file path to load.
 * @param {import('./types.js').LoadOptions & FixedParseOptions} [options]
 * Fixed width parse options.
 * @return {Promise<ColumnTable>} A Promise to an Arquero table.
 * @example aq.loadFixedWidth('data/table.txt', { names: ['name', 'city', state'], widths: [10, 20, 2] })
 */
export async function loadFixed(path, options) {
  return fromFixedStream(await textStream(path, options), options);
}

function transforms({
  skip = 0,
  comment = undefined,
  positions = undefined,
  widths = undefined
} = {}) {
  if (!positions && !widths) {
    error('Fixed width files require a "positions" or "widths" option.');
  }
  let p = 0;
  const breaks = positions || widths.map(w => [p, p += w]);
  return [
    textLineTransformer(),
    lineFilterTransformer(skip, comment, row => row[0]),
    fixedTextTransformer(breaks)
  ];
}

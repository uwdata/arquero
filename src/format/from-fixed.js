import ColumnTable from '../table/column-table'; // eslint-disable-line no-unused-vars

import fromTextRows from './from-text-rows';
import parseLines from './parse/parse-lines';
import error from '../util/error';

/**
 * Options for fixed width file parsing.
 * @typedef {object} FixedParseOptions
 * @property {[number, number][]} [positions] Array of start, end indices for
 *  fixed-width columns.
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
 * @property {Object.<string, (value: string) => any>} [parse] Object of
 *  column parsing options. The object keys should be column names. The object
 *  values should be parsing functions that transform values upon input.
 */

/**
 * Parse a fixed-width file (FWF) string into a table. By default, automatic
 * type inference is performed for input values; string values that match the
 * ISO standard date format are parsed into JavaScript Date objects. To
 * disable this behavior, set the autoType option to false. To perform custom
 * parsing of input column values, use the parse option.
 * @param {string} text A string in a fixed-width file format.
 * @param {FixedParseOptions} options The formatting options.
 * @return {ColumnTable} A new table containing the parsed values.
 */
export default function(text, options = {}) {
  const read = parseLines(text, options);
  const p = positions(options);
  return fromTextRows(
    () => {
      const line = read();
      if (line) {
        return p.map(([i, j]) => line.slice(i, j).trim());
      }
    },
    options.names,
    options
  );
}

function positions({ positions, widths }) {
  if (!positions && !widths) {
    error('Fixed width files require a "positions" or "widths" option');
  }
  let i = 0;
  return positions || widths.map(w => [i, i += w]);
}
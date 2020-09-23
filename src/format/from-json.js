import ColumnTable from '../table/column-table';
import parseIsoDate from '../util/parse-iso-date';

function autoType(key, value) {
  return typeof value === 'string'
    ? parseIsoDate(value, d => new Date(d))
    : value;
}

/**
 * Options for JSON parsing.
 * @typedef {Object} JSONParseOptions
 * @property {boolean} [autoType=true] Flag controlling automatic type inference.
 *  If set to false, automatic date parsing for input JSON strings is disabled.
 * @property {Object} [parse] Object of column parsing options.
 *  The object keys should be column names. The object values should be
 *  parsing functions to invoke to transform values upon input.
 */

/**
 * Parse JavaScript Object Notation (JSON) data into a table. The expected
 * JSON format is an object with column names for keys and column value
 * arrays for values. By default string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {string|Object} data A string in a JSON format, or a
 *  corresponding Object instance.
 * @param {JSONParseOptions} options The formatting options.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export default function(data, options = {}) {
  if (typeof data === 'string') {
    data = JSON.parse(
      data,
      options.autoType === false ? null : autoType
    );
  }

  if (options.parse) {
    for (const name in options.parse) {
      data[name] = data[name].map(options.parse[name]);
    }
  }

  return new ColumnTable(data);
}
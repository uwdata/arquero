import ColumnTable from '../table/column-table';
import defaultTrue from '../util/default-true';
import isArrayType from '../util/is-array-type';
import isObject from '../util/is-object';
import parseIsoDate from '../util/parse-iso-date';

function autoType(key, value) {
  return typeof value === 'string'
    ? parseIsoDate(value, d => new Date(d))
    : value;
}

/**
 * Options for JSON parsing.
 * @typedef {object} JSONParseOptions
 * @property {boolean} [autoType=true] Flag controlling automatic type
 *  inference. If false, date parsing for input JSON strings is disabled.
 * @property {object} [parse] Object of column parsing options.
 *  The object keys should be column names. The object values should be
 *  parsing functions to invoke to transform values upon input.
 */

/**
 * Parse JavaScript Object Notation (JSON) data into a table.
 * The expected JSON data format is an object with column names for keys
 * and column value arrays for values. By default string values that match
 * the ISO standard date format are parsed into JavaScript Date objects.
 * To disable this behavior, set the autoType option to false. To perform
 * custom parsing of input column values, use the parse option.
 * The data payload can also be provided as the "data" property of an
 * enclosing object, with an optional "schema" property containing table
 * metadata such as a "fields" array of ordered column information.
 * @param {string|object} data A string in JSON format, or pre-parsed object.
 * @param {JSONParseOptions} options The formatting options.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export default function(json, options = {}) {
  if (typeof json === 'string') {
    json = JSON.parse(
      json,
      defaultTrue(options.autoType, autoType, null)
    );
  }

  let data = json.data, names;
  if (isObject(data) && !isArrayType(data)) {
    if (json.schema && json.schema.fields) {
      names = json.schema.fields.map(f => f.name);
    }
  } else {
    data = json;
  }

  if (options.parse) {
    for (const name in options.parse) {
      data[name] = data[name].map(options.parse[name]);
    }
  }

  return new ColumnTable(data, null, null, null, null, names);
}
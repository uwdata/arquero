import ColumnTable from '../table/column-table';
import defaultTrue from '../util/default-true';
import isArrayType from '../util/is-array-type';
import isDigitString from '../util/is-digit-string';
import isISODateString from '../util/is-iso-date-string';
import isObject from '../util/is-object';
import isString from '../util/is-string';

/**
 * Options for JSON parsing.
 * @typedef {object} JSONParseOptions
 * @property {boolean} [autoType=true] Flag controlling automatic type
 *  inference. If false, date parsing for input JSON strings is disabled.
 * @property {Object.<string, (value: any) => any>} [parse] Object of column
 *  parsing options. The object keys should be column names. The object values
 *  should be parsing functions that transform values upon input.
 */

/**
 * Parse JavaScript Object Notation (JSON) data into a table.
 * The expected JSON data format is an object with column names for keys
 * and column value arrays for values. By default string values that match
 * the ISO standard date format are parsed into JavaScript Date objects.
 * To disable this behavior, set the autoType option to false. To perform
 * custom parsing of input column values, use the parse option. Auto-type
 * parsing is not performed for columns with custom parse options.
 * The data payload can also be provided as the "data" property of an
 * enclosing object, with an optional "schema" property containing table
 * metadata such as a "fields" array of ordered column information.
 * @param {string|object} data A string in JSON format, or pre-parsed object.
 * @param {JSONParseOptions} options The formatting options.
 * @return {ColumnTable} A new table containing the parsed values.
 */
export default function(json, options = {}) {
  const autoType = defaultTrue(options.autoType);

  // parse string input
  if (isString(json)) {
    json = JSON.parse(json);
  }

  // separate schema and data, as needed
  let data = json.data, names;
  if (isObject(data) && !isArrayType(data)) {
    if (json.schema && json.schema.fields) {
      names = json.schema.fields.map(f => f.name);
    }
  } else {
    data = json;
  }

  // parse values as necessary
  if (autoType || options.parse) {
    const parsers = options.parse || {};
    for (const name in data) {
      const col = data[name];
      const len = col.length;
      if (parsers[name]) {
        // apply custom parser
        for (let i = 0; i < len; ++i) {
          col[i] = parsers[name](col[i]);
        }
      } else if (autoType) {
        // apply autoType parser
        for (let i = 0; i < len; ++i) {
          const val = col[i];
          if (isString(val) && isISODateString(val) && !isDigitString(val)) {
            col[i] = new Date(val);
          }
        }
      }
    }
  }

  return new ColumnTable(data, names);
}
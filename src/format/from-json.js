import { ColumnTable } from '../table/ColumnTable.js';
import { isArray } from '../util/is-array.js';
import { isDigitString } from '../util/is-digit-string.js';
import { isISODateString } from '../util/is-iso-date-string.js';
import { isString } from '../util/is-string.js';
import { collectJSON } from './stream/collect.js';
import { COLUMNS, NDJSON } from './stream/constants.js';
import { lineFilterTransformer } from './stream/line-filter-stream.js';
import { parseJSONStream, parseJSONSync } from './stream/parse-json-rows.js';
import { textLineTransformer } from './stream/text-line-stream.js';
import { textStream } from './stream/text-stream.js';

/**
 * Options for JSON parsing.
 * @typedef {object} JSONParseOptions
 * @property {'columns' | 'rows' | 'ndjson' | null} [type] The format type.
 *  One of `'columns'` (for an object with named column arrays)`, 'rows'` (for
 *  an array for row objects), or `'ndjson'` for [newline-delimited JSON][1]
 *  rows. For `'ndjson'`, each line of text must contain a JSON row object
 *  (with no trailing comma) and string properties must not contain any
 *  newline characters. If no format type is specified, one of `'rows'` or
 *  `'columns'` is inferred from the structure of the parsed JSON.
 *
 *  [1]: https://github.com/ndjson/ndjson-spec
 * @property {boolean} [autoType=true] Flag controlling automatic type
 *  inference for column values. If false, date parsing for input JSON
 *  strings is disabled.
 * @property {Record<string, (value: any) => any>} [parse] Object of column
 *  parsing options. The object keys should be column names. The object values
 *  should be parsing functions that transform values upon input.
 * @property {string[]} [columns] An array of column names to include. JSON
 *  properties missing from this list are not included in the table.
 * @property {number} [skip=0] The number of lines to skip before reading data.
 *  Applicable to newline-delimited (NDJSON) data only.
 * @property {string} [comment] A string used to identify comment lines. Any
 *  lines that start with the comment pattern are skipped. Applicable to
 *   newline-delimited (NDJSON)  data only.
 */

/**
 * Parse JavaScript Object Notation (JSON) data into a table.
 * By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {string} input The input text or stream.
 * @param {JSONParseOptions} options The JSON parse options.
 * @return {ColumnTable} A new table containing the parsed values.
 */
export function fromJSON(input, options = {}) {
  const { columns = undefined, type = undefined } = options;
  let data;
  if (type === NDJSON) {
    data = parseJSONSync(input, columns, transforms(options));
  } else {
    const json = isString(input) ? JSON.parse(input) : input;
    data = (type === COLUMNS || (!type && !isArray(json)))
      ? parseJSONColumns(json, columns)
      : parseJSONRows(json, columns);
  }
  return postprocessJSON(data, options);
}

/**
 * Parse a JavaScript Object Notation (JSON) stream into a table.
 * By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {ReadableStream<string>} input The input text or stream.
 * @param {JSONParseOptions} options The JSON parse options.
 * @return {Promise<ColumnTable>} A Promise to a new table containing the
 *  parsed values.
 */
export async function fromJSONStream(input, options = {}) {
  return options.type === NDJSON
    ? postprocessJSON(
        await parseJSONStream(input, options.columns, transforms(options)),
        options
      )
    : fromJSON(await collectJSON(input), options);
}

/**
 * Load a JSON file from a URL and return a Promise for an Arquero table.
 * If the loaded JSON is array-valued, an array-of-objects format is assumed
 * and the aq.from method is used to construct the table. Otherwise, a
 * column object format is assumed and aq.fromJSON is applied.
 * @param {string} path The URL or file path to load.
 * @param {import('./types.js').LoadOptions & JSONParseOptions} [options]
 *  JSON parse options.
 * @return {Promise<ColumnTable>} A Promise to an Arquero table.
 * @example aq.loadJSON('data/table.json')
 */
export async function loadJSON(path, options) {
  const input = await textStream(path, options);
  if (!options?.type &&
    path.slice(-NDJSON.length-1).toLowerCase() === `.${NDJSON}`) {
    options = { ...options, type: NDJSON };
  }
  return fromJSONStream(input, options);
}

function transforms({
  comment = undefined,
  skip = 0
} = {}) {
  return [
    textLineTransformer(),
    lineFilterTransformer(skip, comment)
  ];
}

/**
 * @param {import('../table/types.js').ColumnData} data Initial column data.
 * @param {string[]} [names] The column names to use.
 * @return {{
 *   columns: import('../table/types.js').ColumnData,
 *   names: string[]
 * }}
 */
function parseJSONColumns(data, names) {
  /** @type {import('../table/types.js').ColumnData} */
  let columns = data;
  if (names) {
    columns = names.reduce((c, name) => (c[name] = data[name], c), {});
  } else {
    names = Object.keys(columns);
  }
  return { columns, names };
}

/**
 * @param {object[]} data The input row objects.
 * @param {string[]} [names] The column names to use.
 * @return {{
 *   columns: import('../table/types.js').ColumnData,
 *   names: string[]
 * }}
 */
function parseJSONRows(data, names) {
  names ??= Object.keys(data[0]);
  const cols = names.map(() => []);

  const n = data.length;
  const m = names.length;
  for (let i = 0; i < n; ++i) {
    const obj = data[i];
    for (let j = 0; j < m; ++j) {
      cols[j].push(obj[names[j]]);
    }
  }

  /** @type {import('../table/types.js').ColumnData} */
  const columns = {};
  names.forEach((name, i) => columns[name] = cols[i]);
  return { columns, names };
}

/**
 * Post-process JavaScript Object Notation (JSON) data, performing type
 * inference as needed and returning a table instance.
 * @param {{
 *  columns: import('../table/types.js').ColumnData,
 *  names: string[]
 * }} data The column data.
 * @param {JSONParseOptions} [options] The JSON parse options.
 * @return {ColumnTable} A new table containing the parsed values.
 */
function postprocessJSON({ columns, names }, {
  autoType = true,
  parse = undefined
} = {}) {
  // parse values as necessary
  if (autoType || parse) {
    const parsers = parse || {};
    for (const name in columns) {
      const col = columns[name];
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

  return new ColumnTable(columns, names);
}

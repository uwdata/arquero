import isArray from '../util/is-array.js';
import isDigitString from '../util/is-digit-string.js';
import isISODateString from '../util/is-iso-date-string.js';
import isString from '../util/is-string.js';
import { ColumnTable } from '../table/ColumnTable.js';
import { collectJSON } from './util/collect.js';
import { COLUMNS, NDJSON } from './util/constants.js';
import { lineFilter } from './util/line-filter-stream.js';
import { pipeline } from './util/pipeline.js';
import { TextLineStream } from './util/text-line-stream.js';
import { textStream } from './util/text-stream.js';
import { toTextStream } from './util/to-text-stream.js';

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
  return parseJSON(input, options);
}

/**
 * Parse JavaScript Object Notation (JSON) data into a table.
 * By default, automatic type inference is performed
 * for input values; string values that match the ISO standard
 * date format are parsed into JavaScript Date objects. To disable this
 * behavior, set the autoType option to false. To perform custom parsing
 * of input column values, use the parse option.
 * @param {ReadableStream<string> | string} input The input text or stream.
 * @param {JSONParseOptions} options The JSON parse options.
 * @return {Promise<ColumnTable>} A Promise to a new table containing the
 *  parsed values.
 */
export async function parseJSON(input, options = {}) {
  const { type = undefined, columns = undefined } = options;

  let data;
  if (type === NDJSON) {
    data = await parseNDJSON(toTextStream(input), options);
  } else {
    const json = await collectJSON(input);
    data = (type === COLUMNS || (!type && !isArray(json)))
      ? parseJSONColumns(json, columns)
      : parseJSONRows(json, columns);
  }
  return postprocessJSON(data.columns, data.names, options);
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
 * @param {ReadableStream<string>} input The input text stream.
 * @param {JSONParseOptions} options The parse options.
 * @return {Promise<{
 *   columns: import('../table/types.js').ColumnData,
 *   names: string[]
 * }>}
 */
function parseNDJSON(input, {
  skip = 0,
  comment = undefined,
  columns = undefined
} = {}) {
  return readNDJSON(
    pipeline(input, [new TextLineStream(), lineFilter(skip, comment)]),
    columns
  );
}

async function readNDJSON(stream, names) {
  const iter = stream[Symbol.asyncIterator]();
  const first = (await iter.next()).value;

  names ??= Object.keys(firstNonNull(first));
  const cols = names.map(() => []);
  const n = names.length;

  function readBatch(chunk) {
    for (let c = 0; c < chunk.length; ++c) {
      if (chunk[c]) {
        const obj = JSON.parse(chunk[c]);
        for (let i = 0; i < n; ++i) {
          cols[i].push(obj[names[i]]);
        }
      }
    }
  }

  readBatch(first);
  for await (const chunk of iter) {
    readBatch(chunk);
  }

  /** @type {import('../table/types.js').ColumnData} */
  const columns = {};
  names.forEach((name, i) => columns[name] = cols[i]);
  return { columns, names };
}

function firstNonNull(lines) {
  const l = lines.find(l => l.length);
  return JSON.parse(l);
}

/**
 * Post-process JavaScript Object Notation (JSON) data, performing type
 * inference as needed and returning a table instance.
 * @param {import('../table/types.js').ColumnData} columns The column data.
 * @param {string[]} names The column names.
 * @param {JSONParseOptions} [options] The JSON parse options.
 * @return {ColumnTable} A new table containing the parsed values.
 */
function postprocessJSON(columns, names, {
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

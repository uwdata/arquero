import { identity } from '../../util/identity.js';
import { isFunction } from '../../util/is-function.js';
import { repeat } from '../../util/repeat.js';
import { parseValues } from '../../util/parse-values.js';
import { pipelineStream, pipelineSync } from './pipeline.js';
import { ColumnTable } from '../../table/ColumnTable.js';
import { streamIterator } from './stream-iterator.js';

/**
 * Create a table from column names and value arrays.
 * @param {string[]} names Column names
 * @param {any[]} values Column value arrays
 * @returns {ColumnTable}
 */
function toTable(names, values) {
  /** @type {import('../../table/types.js').ColumnData} */
  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns, names);
}

/**
 * Create a table from delimited text rows.
 * @param {string} input
 * @param {Transformer[]} transformers
 * @param {*} [options]
 * @returns {ColumnTable}
 */
export function parseTextRowsSync(input, transformers, options = {}) {
  /** @type {string[][]} */
  const rows = pipelineSync(input, transformers);
  const { names, values } = parseTextRowBatches([rows], options);
  return toTable(names, values);
}

/**
 * Create a table from a stream of delimited text rows.
 * @param {ReadableStream<string>} input
 * @param {*} [options]
 * @returns {Promise<ColumnTable>}
 */
export async function parseTextRowsStream(input, transformers, options = {}) {
  const stream = pipelineStream(input, transformers);

  // pull batches from stream to meet type inference needs
  const automax = +options.autoMax || 1000;
  const iter = streamIterator(stream);
  const init = [];
  let size = 0;
  while (size < automax) {
    const next = await iter.next();
    const batch = next.value;
    if (batch?.length > 0) {
      init.push(batch);
      size += batch.length;
    }
    if (next.done) break;
  }

  // parse initial batches, retrieve type parser functions
  const { names, values, parsers } = parseTextRowBatches(init, options);
  const n = names.length;

  // parse remainder of stream
  for await (const batch of iter) {
    for (let r = 0; r < batch.length; ++r) {
      const row = batch[r];
      for (let i = 0; i < n; ++i) {
        values[i].push(row[i] ? parsers[i](row[i]) : null);
      }
    }
  }

  return toTable(names, values);
}

/**
 * Create column value arrays for batches of text rows.
 * @param {string[][][]} batches
 * @param {*} options
 * @returns {{ names: string[], values: any[], parsers: ReturnType<getParsers> }}
 */
function parseTextRowBatches(batches, options) {
  const [batch] = batches;
  const n = batch[0].length;
  const automax = +options.autoMax || 1000;
  const values = repeat(n, () => []);
  let names = options.header !== false ? batch.shift() : options.names;
  names = names
    ? names.length < n ? [...names, defaultNames(n, names.length)] : names
    : defaultNames(n);

  // transpose text rows into column arrays
  for (const batch of batches) {
    for (let r = 0; r < batch.length; ++r) {
      const row = batch[r];
      for (let i = 0; i < n; ++i) {
        values[i].push(row[i] === '' ? null : row[i]);
      }
    }
  }

  // initialize parsers
  const parsers = getParsers(names, values, { ...options, limit: automax });

  // apply parsers to column arrays
  parsers.forEach((parse, i) => {
    if (parse === identity) return;
    const v = values[i];
    for (let r = 0; r < v.length; ++r) {
      if (v[r] != null) v[r] = parse(v[r]);
    }
  });

  return { names, values, parsers };
}

function defaultNames(n, off = 0) {
  return repeat(n - off, i => `col${i + off + 1}`);
}

function getParsers(names, values, options) {
  const { parse = {} } = options;
  const noParse = options.autoType === false;

  return names.map(
    (name, i) => isFunction(parse[name]) ? parse[name]
      : noParse ? identity
      : parseValues(values[i], options)
  );
}

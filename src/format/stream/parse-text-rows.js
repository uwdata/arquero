import { identity } from '../../util/identity.js';
import { isFunction } from '../../util/is-function.js';
import { repeat } from '../../util/repeat.js';
import { parseValues } from '../../util/parse-values.js';

function defaultNames(n, off = 0) {
  return repeat(n - off, i => `col${i + off + 1}`);
}

/**
 * Create a table from delimited rows of text.
 * @param {ReadableStream<string[][]>} stream
 * @param {*} options
 * @returns {Promise<{
 *   columns: import('../../table/types.js').ColumnData,
 *   names: string[]
 * }>}
 */
export async function parseTextRows(stream, options) {
  const iter = stream[Symbol.asyncIterator]();
  let batch = (await iter.next()).value;

  const n = batch[0].length;
  const automax = +options.autoMax || 1000;
  const values = repeat(n, () => []);
  let names = options.header !== false ? batch.shift() : options.names;
  names = names
    ? names.length < n ? [...names, defaultNames(n, names.length)] : names
    : defaultNames(n);

  // scan initial rows to use for type inference
  let idx = 0;
  while (batch && idx < automax) {
    for (let r = 0; r < batch.length; ++r) {
      const row = batch[r];
      for (let i = 0; i < n; ++i) {
        values[i].push(row[i] === '' ? null : row[i]);
      }
    }
    idx += batch.length;
    if (idx < automax) {
      batch = (await iter.next()).value;
    }
  }

  // initialize parsers
  const parsers = getParsers(names, values, { ...options, limit: automax });

  // apply parsers to initial rows
  parsers.forEach((parse, i) => {
    if (parse === identity) return;
    const v = values[i];
    for (let r = 0; r < idx; ++r) {
      if (v[r] != null) v[r] = parse(v[r]);
    }
  });

  // parse remainder of file
  for await (const batch of iter) {
    for (let r = 0; r < batch.length; ++r) {
      const row = batch[r];
      for (let i = 0; i < n; ++i) {
        values[i].push(row[i] ? parsers[i](row[i]) : null);
      }
    }
  }

  /** @type {import('../../table/types.js').ColumnData} */
  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return { columns, names };
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

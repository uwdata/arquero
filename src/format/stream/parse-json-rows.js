import { pipelineStream, pipelineSync } from './pipeline.js';
import { streamIterator } from './stream-iterator.js';

export function parseJSONSync(input, columns, transformers) {
  /** @type {string[][]} */
  const rows = pipelineSync(input, transformers);
  const { names, values } = parseJSONColumns(rows, columns);
  parseJSONRowBatch(rows, names, values);
  return toColumnData(names, values);
}

export async function parseJSONStream(input, columns, transformers) {
  const stream = pipelineStream(input, transformers);
  const iter = streamIterator(stream);
  let first;
  do { first = (await iter.next()).value; } while (first.length === 0);
  const { names, values } = parseJSONColumns(first, columns);
  parseJSONRowBatch(first, names, values);
  for await (const chunk of iter) {
    parseJSONRowBatch(chunk, names, values);
  }
  return toColumnData(names, values);
}

/**
 * @param {string[]} names
 * @param {any[][]} values
 */
function toColumnData(names, values) {
  /** @type {import('../../table/types.js').ColumnData} */
  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return { columns, names };
}

function firstNonNull(lines) {
  const l = lines.find(l => l.length);
  return JSON.parse(l);
}

function parseJSONColumns(batch, columns) {
  const names = columns ?? Object.keys(firstNonNull(batch));
  return { names, values: names.map(() => []) };
}

function parseJSONRowBatch(batch, names, values) {
  const n = names.length;
  for (let r = 0; r < batch.length; ++r) {
    const row = batch[r];
    if (row) {
      const obj = JSON.parse(row);
      for (let i = 0; i < n; ++i) {
        values[i].push(obj[names[i]]);
      }
    }
  }
}

import { aggregateGet } from './reduce/util';
import toArray from '../util/to-array';
import has from '../util/has';

export default function(table, { values = {}, ops = [], drop = {} }, options = {}) {
  const limit = options.limit > 0 ? +options.limit : Infinity;
  const names = Object.keys(values);
  const n = names.length;
  if (n === 0) return table;

  const get = aggregateGet(table, ops, Object.values(values));

  // initialize output columns
  const data = {};
  const priors = [];
  const copies = [];
  const unrolled = Array(n);

  // original and copied columns
  table.columnNames().forEach(name => {
    if (!has(drop, name)) {
      const col = data[name] = [];
      if (!has(values, name)) {
        priors.push(table.column(name));
        copies.push(col);
      }
    }
  });

  // unrolled output columns
  names.forEach((name, i) => {
    if (!has(data, name)) data[name] = [];
    unrolled[i] = data[name];
  });

  let index = 0;
  const m = priors.length;

  table.scan((row, data) => {
    let maxlen = 0;

    // extract parallel array data
    const arrays = get.map(fn => {
      const value = toArray(fn(row, data));
      maxlen = Math.min(Math.max(maxlen, value.length), limit);
      return value;
    });

    // copy original table data
    for (let i = 0; i < m; ++i) {
      copies[i].length = index + maxlen;
      copies[i].fill(priors[i].get(row), index, index + maxlen);
    }

    // copy unrolled array data
    for (let i = 0; i < n; ++i) {
      const col = unrolled[i];
      const arr = arrays[i];
      for (let j = 0; j < maxlen; ++j) {
        col[index + j] = arr[j];
      }
    }

    index += maxlen;
  });

  return table.create({ data, filter: null, groups: null, order: null });
}
import { aggregateGet } from './reduce/util';
import toArray from '../util/to-array';
import has from '../util/has';

export default function(table, { values = {}, ops = [] }, options = {}) {
  const names = Object.keys(values);
  if (!names.length) return table;

  const limit = options.limit > 0 ? +options.limit : Infinity;
  const drop = options.drop || {};
  const get = aggregateGet(table, ops, Object.values(values));

  // initialize output columns
  const data = {};
  const priors = [];
  const copies = [];
  const unroll = [];

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
  names.forEach(name => {
    if (!has(drop, name)) {
      if (!has(data, name)) data[name] = [];
      unroll.push(data[name]);
    }
  });

  let index = 0;
  const m = priors.length;
  const n = unroll.length;

  const copy = (row, maxlen) => {
    for (let i = 0; i < m; ++i) {
      copies[i].length = index + maxlen;
      copies[i].fill(priors[i].get(row), index, index + maxlen);
    }
  };

  if (n === 1) {
    // optimize common case of one array-valued column
    const fn = get[0];
    const col = unroll[0];

    table.scan((row, data) => {
      // extract array data
      const array = toArray(fn(row, data));
      const maxlen = Math.min(array.length, limit);

      // copy original table data
      copy(row, maxlen);

      // copy unrolled array data
      for (let j = 0; j < maxlen; ++j) {
        col[index + j] = array[j];
      }

      index += maxlen;
    });
  } else {
    table.scan((row, data) => {
      let maxlen = 0;

      // extract parallel array data
      const arrays = get.map(fn => {
        const value = toArray(fn(row, data));
        maxlen = Math.min(Math.max(maxlen, value.length), limit);
        return value;
      });

      // copy original table data
      copy(row, maxlen);

      // copy unrolled array data
      for (let i = 0; i < n; ++i) {
        const col = unroll[i];
        const arr = arrays[i];
        for (let j = 0; j < maxlen; ++j) {
          col[index + j] = arr[j];
        }
      }

      index += maxlen;
    });
  }

  return table.create({
    data,
    filter: null,
    groups: null,
    order:  null
  });
}
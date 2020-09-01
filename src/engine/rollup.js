import { aggregate, groupInit, groupOutput, reducers } from './reduce/util';
import reduce from './reduce';
import isArray from '../util/is-array';

export default function(table, { values, ops }) {
  if (values == null) {
    // no expression values, only operator output
    return reduce(table, reducers(ops));
  }

  // output data
  const data = {};

  // write groupby fields to output
  if (table.isGrouped()) {
    groupOutput(data, table, groupInit(data, table).fill(1));
  }

  // perform aggregation and return output table
  return table.create({
    data: output(values, aggregate(table, ops), data),
    filter: null,
    groups: null,
    order:  null
  });
}

function output(values, result, data) {
  const grouped = isArray(result);
  const size = grouped ? result.length : 1;

  if (grouped) {
    for (const name in values) {
      const get = values[name];
      const col = data[name] = Array(size);
      for (let i = 0; i < size; ++i) {
        col[i] = get(i, null, result[i]);
      }
    }
  } else {
    for (const name in values) {
      const get = values[name];
      const col = data[name] = Array(size);
      col[0] = get(0, null, result);
    }
  }

  return data;
}
import { aggregate, groupInit, groupOutput } from './reduce/util';
import columnSet from '../table/column-set';
import isArray from '../util/is-array';

export default function(table, { names, exprs, ops }) {
  // output data
  const cols = columnSet();

  // write groupby fields to output
  if (table.isGrouped()) {
    groupOutput(cols.data, table, groupInit(cols, table).fill(1));
  }

  // generate summary output
  output(names, exprs, aggregate(table, ops), cols);

  // perform aggregation and return output table
  return table.create(cols.new());
}

function output(names, exprs, result, cols) {
  const grouped = isArray(result);
  const size = grouped ? result.length : 1;
  const n = names.length;

  if (grouped) {
    for (let i = 0; i < n; ++i) {
      const get = exprs[i];
      const col = Array(size);
      for (let j = 0; j < size; ++j) {
        col[j] = get(j, null, result[j]);
      }
      cols.add(names[i], col);
    }
  } else {
    for (let i = 0; i < n; ++i) {
      const get = exprs[i];
      cols.add(names[i], [ get(0, null, result) ]);
    }
  }
}
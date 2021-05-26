import { aggregate, groupOutput } from './reduce/util';
import columnSet from '../table/column-set';

export default function(table, { names, exprs, ops }) {
  // output data
  const cols = columnSet();
  const groups = table.groups();

  // write groupby fields to output
  if (groups) groupOutput(cols, groups);

  // compute and write aggregate output
  output(names, exprs, groups, aggregate(table, ops), cols);

  // return output table
  return table.create(cols.new());
}

function output(names, exprs, groups, result = [], cols) {
  if (!exprs.length) return;
  const size = groups ? groups.size : 1;
  const op = (id, row) => result[id][row];
  const n = names.length;

  for (let i = 0; i < n; ++i) {
    const get = exprs[i];
    if (get.field != null) {
      // if expression is op only, use aggregates directly
      cols.add(names[i], result[get.field]);
    } else if (size > 1) {
      // if multiple groups, evaluate expression for each
      const col = cols.add(names[i], Array(size));
      for (let j = 0; j < size; ++j) {
        col[j] = get(j, null, op);
      }
    } else {
      // if only one group, no need to loop
      cols.add(names[i], [ get(0, null, op) ]);
    }
  }
}
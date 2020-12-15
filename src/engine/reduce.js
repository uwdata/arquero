import { groupInit, groupOutput, reduceFlat, reduceGroups } from './reduce/util';
import columnSet from '../table/column-set';

export default function(table, reducer) {
  const cols = columnSet();

  if (table.isGrouped()) {
    const groups = table.groups();
    const counts = groupInit(cols, table);
    output(
      reduceGroups(table, reducer, groups),
      reducer, cols, counts
    );
    groupOutput(cols.data, table, counts);
  } else {
    output(
      reduceFlat(table, reducer),
      reducer, cols
    );
  }

  return table.create(cols.new());
}

function output(cells, reducer, cols, counts) {
  // initialize output columns
  reducer.outputs().map(name => cols.add(name, []));
  const { data } = cols;

  // write aggregate values to output columns
  if (counts) {
    const n = counts.length;
    for (let i = 0; i < n - 1; ++i) {
      counts[i + 1] = reducer.writeToArrays(cells[i], data, counts[i]);
    }
  } else {
    reducer.writeToArrays(cells, data, 0);
  }
}
import { groupInit, groupOutput, reduceFlat, reduceGroups } from './reduce/util';

export default function(table, reducer) {
  const data = {};

  if (table.isGrouped()) {
    const groups = table.groups();
    const counts = groupInit(data, table);
    output(
      reduceGroups(table, reducer, groups),
      reducer, data, counts
    );
    groupOutput(data, table, counts);
  } else {
    output(
      reduceFlat(table, reducer),
      reducer, data
    );
  }

  return table.create({
    data,
    filter: null,
    groups: null,
    order: null
  });
}

function output(cells, reducer, data, counts) {
  // initialize output columns
  reducer.outputs().map(name => data[name] = []);

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
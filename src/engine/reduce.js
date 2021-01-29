import { reduceFlat, reduceGroups } from './reduce/util';
import columnSet from '../table/column-set';

export default function(table, reducer) {
  const cols = columnSet();
  const groups = table.groups();

  // initialize groups
  const { get, names = [], rows, size = 1 } = groups || {};
  const counts = new Uint32Array(size + 1);
  names.forEach(name => cols.add(name, null));

  // compute reduced values
  const cells = groups
    ? reduceGroups(table, reducer, groups)
    : [ reduceFlat(table, reducer) ];

  // initialize output columns
  reducer.outputs().map(name => cols.add(name, []));

  // write reduced values to output columns
  const n = counts.length - 1;
  let len = 0;
  for (let i = 0; i < n; ++i) {
    len += counts[i + 1] = reducer.write(cells[i], cols.data, counts[i]);
  }

  // write group values to output columns
  if (groups) {
    const data = table.data();
    names.forEach((name, index) => {
      const column = cols.data[name] = Array(len);
      const getter = get[index];
      for (let i = 0, j = 0; i < size; ++i) {
        column.fill(getter(rows[i], data), j, j += counts[i + 1]);
      }
    });
  }

  return table.create(cols.new());
}
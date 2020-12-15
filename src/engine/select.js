import columnSet from '../table/column-set';
import error from '../util/error';
import isString from '../util/is-string';

export default function(table, columns) {
  const cols = columnSet();

  columns.forEach((value, curr) => {
    const next = isString(value) ? value : curr;
    if (next) {
      const col = table.column(curr) || error(`Unrecognized column: ${curr}`);
      cols.add(next, col);
    }
  });

  return table.create(cols);
}
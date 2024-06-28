import columnSet from '../table/column-set.js';
import { table as newTable } from '../table/index.js';
import error from '../util/error.js';

export function assign(table, others) {
  const nrows = table.numRows();
  const base = table.reify();
  const cols = columnSet(base).groupby(base.groups());
  others.forEach(input => {
    input = newTable(input);
    if (input.numRows() !== nrows) error('Assign row counts do not match');
    input = input.reify();
    input.columnNames(name => cols.add(name, input.column(name)));
  });
  return table.create(cols.new());
}

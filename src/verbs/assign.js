import { columnSet } from '../table/ColumnSet.js';
import { Table } from '../table/Table.js';
import { error } from '../util/error.js';

export function assign(table, ...others) {
  others = others.flat();
  const nrows = table.numRows();
  const base = table.reify();
  const cols = columnSet(base).groupby(base.groups());
  others.forEach(input => {
    input = input instanceof Table ? input : new Table(input);
    if (input.numRows() !== nrows) error('Assign row counts do not match');
    input = input.reify();
    input.columnNames(name => cols.add(name, input.column(name)));
  });
  return cols.new(table);
}

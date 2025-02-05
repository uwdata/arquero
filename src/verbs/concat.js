import { columnSet } from '../table/ColumnSet.js';
import { NULL } from '../util/null.js';

export function concat(table, ...others) {
  others = others.flat();
  const trows = table.numRows();
  const nrows = trows + others.reduce((n, t) => n + t.numRows(), 0);
  if (trows === nrows) return table;

  const tables = [table, ...others];
  const cols = columnSet();

  table.columnNames().forEach(name => {
    const arr = Array(nrows);
    let row = 0;
    tables.forEach(table => {
      const col = table.column(name) || { at: () => NULL };
      table.scan(trow => arr[row++] = col.at(trow));
    });
    cols.add(name, arr);
  });

  return cols.new(table);
}

import columnSet from '../table/column-set';

export default function(table, others) {
  if (others.length === 0) return table;

  const tables = [table, ...others];
  const nrows = tables.reduce((n, t) => n + t.numRows(), 0);
  const cols = columnSet();

  table.columnNames().forEach(name => {
    const arr = Array(nrows);
    let row = 0;
    tables.forEach(table => {
      const col = table.column(name) || { get: () => undefined };
      table.scan(trow => arr[row++] = col.get(trow));
    });
    cols.add(name, arr);
  });

  return table.create(cols.new());
}
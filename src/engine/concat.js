import Column from '../table/column';

export default function(table, others) {
  if (others.length === 0) return table;

  const tables = [table, ...others];
  const names = table.columnNames();
  const nrows = tables.reduce((n, t) => n + t.numRows(), 0);
  const data = {};

  names.forEach(name => {
    const arr = Array(nrows);
    let row = 0;
    tables.forEach(table => {
      const col = table.column(name) || { get: () => undefined };
      table.scan(trow => arr[row++] = col.get(trow));
    });
    data[name] = Column.from(arr);
  });

  return table.create({
    data,
    filter: null,
    groups: null,
    order:  null
  });
}
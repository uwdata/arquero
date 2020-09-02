export default function(t, table, data, message) {
  table = table.reify();
  const tableData = {};
  for (const name of table.columnNames()) {
    tableData[name] = table.column(name).data;
  }
  t.deepEqual(tableData, data, message);
}
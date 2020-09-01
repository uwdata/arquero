export default function(table, others) {
  const names = table.columnNames();
  return others.length
    ? others.reduce((a, b) => a.semijoin(b.select(names)), table).dedupe()
    : table.reify([]);
}
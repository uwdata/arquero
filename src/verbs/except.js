export default function(table, others) {
  if (others.length === 0) return table;
  const names = table.columnNames();
  return others.reduce((a, b) => a.antijoin(b.select(names)), table).dedupe();
}
export default function(table) {
  return table.isOrdered()
    ? table.create({ order: null })
    : table;
}
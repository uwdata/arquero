export function unorder(table) {
  return table.isOrdered()
    ? table.create({ order: null })
    : table;
}

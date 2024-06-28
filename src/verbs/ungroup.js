export function ungroup(table) {
  return table.isGrouped()
    ? table.create({ groups: null })
    : table;
}

export default function(table) {
  return table.isGrouped()
    ? table.create({ groups: null })
    : table;
}
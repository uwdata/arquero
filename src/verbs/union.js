export default function(table, others) {
  return table.concat(others).dedupe();
}
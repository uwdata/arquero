import uniqueName from '../util/unique-name';

export default function(table, keys = []) {
  const names = table.columnNames();
  const num = uniqueName(names, '_num');
  keys = keys.length ? keys : names;

  return table
    .groupby(keys)
    .derive({ [num]: 'row_number()' })
    .filter(`d.${num} === 1`)
    .select(names)
    .reify();
}
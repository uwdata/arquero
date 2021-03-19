import entries from './entries';
import isArray from './is-array';
import unroll from './unroll';

export default function(table, names) {
  const props = [];
  const cols = [];
  let i = -1;

  for (const entry of entries(names || table.columnNames())) {
    const [name, key] = isArray(entry) ? entry : [entry, entry];
    props.push(`${JSON.stringify(key)}:_${++i}.get(row)`);
    cols.push(table.column(name));
  }

  return unroll('row', '({' + props + '})', cols);
}
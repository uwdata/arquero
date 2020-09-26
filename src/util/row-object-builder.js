import unroll from './unroll';

export default function(table, names) {
  names = names || table.columnNames();
  return unroll(
    names.map(name => table.column(name)),
    'row',
    '({' + names.map((_, i) => `${JSON.stringify(_)}:_${i}.get(row)`) + '})'
  );
}
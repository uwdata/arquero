/**
 * Select columns by index and rename them to the provided names. Returns a
 * selection helper function that takes a table as input and produces a
 * rename map as output. If the number of provided names is less than the
 * number of table columns, the rename map will only include entries for the
 * provided names. If the number of table columns is less than then number of
 * provided names, only the rename map will only include entries that cover
 * the existing columns.
 * @param {...(string|string[])} names An ordered list of column names.
 * @return {Function} Selection function compatible with {@link Table#select}.
 * @example table.rename(aq.names('a', 'b', 'c'))
 * @example table.select(aq.names(['a', 'b', 'c']))
 */
export default function(...names) {
  names = names.flat();
  return table => {
    const m = new Map();
    const n = Math.min(names.length, table.numCols());
    for (let i = 0; i < n; ++i) {
      m.set(table.columnName(i), names[i]);
    }
    return m;
  };
}
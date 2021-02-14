import isArrayType from '../../util/is-array-type';

export function scanArray(data, limit, offset) {
  const n = Math.min(data.length, offset + limit);
  return (name, visit) => {
    for (let i = offset; i < n; ++i) {
      visit(data[i][name], i);
    }
  };
}

export function scanTable(table, limit, offset) {
  const scanAll = offset === 0 && table.numRows() <= limit
               && !table.isFiltered() && !table.isOrdered();

  return (column, visit) => {
    let i = -1;
    scanAll && isArrayType(column.data)
      ? column.data.forEach(visit)
      : table.scan(
          row => visit(column.get(row), ++i),
          true, limit, offset
        );
  };
}
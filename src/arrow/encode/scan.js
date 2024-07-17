import isArrayType from '../../util/is-array-type.js';

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
    const isArray = isArrayType(column);
    let i = -1;
    scanAll && isArray
      ? column.forEach(visit)
      : table.scan(
          // optimize column value access
          isArray
            ? row => visit(column[row], ++i)
            : row => visit(column.at(row), ++i),
          true, limit, offset
        );
  };
}

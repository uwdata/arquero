import { columnFromArray, columnFromValues, tableFromColumns } from '@uwdata/flechette';
import { columns as select } from './util.js';
import isArrayType from '../util/is-array-type.js';

/**
 * Create an Apache Arrow table for an input table.
 * @param {import('../table/Table.js').Table} table
 *  An input Arquero table to convert to Arrow format.
 * @param {import('./types.js').ArrowFormatOptions} [options]
 *  Encoding options, including column data types.
 * @return {import('@uwdata/flechette').Table} An Arrow Table instance.
 */
export default function(table, options = {}) {
  const { columns, limit, offset, types = {}, ...opt } = options;
  const names = select(table, columns);
  const length = table.size;
  const data = table.data();

  // make a full table scan with no indirection?
  const fullScan = offset === 0
    && table.numRows() <= limit
    && !table.isFiltered()
    && !table.isOrdered();

  return tableFromColumns(names.map(name => {
    const values = data[name];
    const type = types[name];
    const isArray = isArrayType(values);
    let col;
    if (fullScan && isArray) {
      // use faster path, take advantange of any typed arrays
      col = columnFromArray(values, type, opt);
    } else {
      // use table scan method to visit column values
      const get = isArray
        ? row => values[row]
        : row => values.at(row);
      col = columnFromValues(
        length,
        visit => table.scan(row => visit(get(row)), true, limit, offset),
        type,
        opt
      );
    }
    return [name, col];
  }));
}
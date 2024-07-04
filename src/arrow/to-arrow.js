import { arrowTable } from './arrow-table.js';
import dataFromObjects from './encode/data-from-objects.js';
import dataFromTable from './encode/data-from-table.js';
import { scanArray, scanTable } from './encode/scan.js';
import error from '../util/error.js';
import isArray from '../util/is-array.js';
import isFunction from '../util/is-function.js';

/**
 * Create an Apache Arrow table for an input dataset.
 * @param {object[]|import('../table/Table.js').Table} data An input dataset
 *  to convert to Arrow format. If array-valued, the data should consist of an
 *  array of objects where each entry represents a row and named properties
 *  represent columns. Otherwise, the input data should be an Arquero table.
 * @param {import('./types.js').ArrowFormatOptions} [options]
 *  Encoding options, including column data types.
 * @return {import('apache-arrow').Table} An Apache Arrow Table instance.
 */
export default function(data, options = {}) {
  const { types = {} } = options;
  const { dataFrom, names, nrows, scan } = init(data, options);
  const cols = {};
  names.forEach(name => {
    const col = dataFrom(data, name, nrows, scan, types[name]);
    if (col.length !== nrows) {
      error('Column length mismatch');
    }
    cols[name] = col;
  });
  return arrowTable(cols);
}

function init(data, options) {
  const { columns, limit = Infinity, offset = 0 } = options;
  const names = isFunction(columns) ? columns(data)
    : isArray(columns) ? columns
    : null;
  if (isArray(data)) {
    return {
      dataFrom: dataFromObjects,
      names: names || Object.keys(data[0]),
      nrows: Math.min(limit, data.length - offset),
      scan: scanArray(data, limit, offset)
    };
  } else if (isTable(data)) {
    return {
      dataFrom: dataFromTable,
      names: names || data.columnNames(),
      nrows: Math.min(limit, data.numRows() - offset),
      scan: scanTable(data, limit, offset)
    };
  } else {
    error('Unsupported input data type');
  }
}

function isTable(data) {
  return data && isFunction(data.reify);
}

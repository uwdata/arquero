import { aggregateGet } from './reduce/util';
import columnSet from '../table/column-set';
import NULL from '../util/null';

export default function(tableL, tableR, [keyL, keyR], { names, exprs, ops }) {
  // instantiate output data
  const cols = columnSet(tableL);
  const total = tableL.totalRows();
  names.forEach(name => cols.add(name, Array(total)));

  // build lookup table
  const lut = new Map();
  tableR.scan((row, data) => {
    const key = keyR(row, data);
    if (key != null && key === key) {
      lut.set(keyR(row, data), row);
    }
  });

  // find matching rows
  const rowL = new Int32Array(tableL.numRows());
  const rowR = new Int32Array(tableL.numRows());
  let m = 0;
  tableL.scan((lrow, data) => {
    const rrow = lut.get(keyL(lrow, data));
    rowL[m] = lrow;
    rowR[m] = rrow == null ? -1 : rrow;
    ++m;
  });

  // output values for matching rows
  const dataR = tableR.data();
  const get = aggregateGet(tableR, ops, exprs);
  const n = get.length;

  for (let i = 0; i < n; ++i) {
    const column = cols.data[names[i]];
    const getter = get[i];
    for (let j = 0; j < m; ++j) {
      const rrow = rowR[j];
      column[rowL[j]] = rrow >= 0 ? getter(rrow, dataR) : NULL;
    }
  }

  return tableL.create(cols);
}
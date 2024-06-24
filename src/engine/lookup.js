import { rowLookup } from './join/lookup.js';
import { aggregateGet } from './reduce/util.js';
import columnSet from '../table/column-set.js';
import NULL from '../util/null.js';
import concat from '../util/concat.js';
import unroll from '../util/unroll.js';

export default function(tableL, tableR, [keyL, keyR], { names, exprs, ops }) {
  // instantiate output data
  const cols = columnSet(tableL);
  const total = tableL.totalRows();
  names.forEach(name => cols.add(name, Array(total).fill(NULL)));

  // build lookup table
  const lut = rowLookup(tableR, keyR);

  // generate setter function for lookup match
  const set = unroll(
    ['lr', 'rr', 'data'],
    '{' + concat(names, (_, i) => `_[${i}][lr] = $[${i}](rr, data);`) + '}',
    names.map(name => cols.data[name]),
    aggregateGet(tableR, ops, exprs)
  );

  // find matching rows, set values on match
  const dataR = tableR.data();
  tableL.scan((lrow, data) => {
    const rrow = lut.get(keyL(lrow, data));
    if (rrow >= 0) set(lrow, rrow, dataR);
  });

  return tableL.create(cols);
}

import { not } from '../helpers/selection.js';
import { columnSet } from '../table/ColumnSet.js';
import { concat } from '../util/concat.js';
import { NULL } from '../util/null.js';
import { unroll } from '../util/unroll.js';
import { rowLookup } from './join/lookup.js';
import { aggregateGet } from './reduce/util.js';
import { inferKeys } from './util/join-keys.js';
import { parseKey } from './util/parse-key.js';
import { parseValue } from './util/parse.js';

export function lookup(tableL, tableR, on, ...values) {
  on = inferKeys(tableL, tableR, on);
  values = values.length === 0
    ? [not(tableL.columnNames())]
    : values.flat();
  return _lookup(
    tableL,
    tableR,
    [ parseKey('lookup', tableL, on[0]), parseKey('lookup', tableR, on[1]) ],
    parseValue('lookup', tableR, values)
  );
}

export function _lookup(tableL, tableR, [keyL, keyR], { names, exprs, ops = [] }) {
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

  return cols.derive(tableL);
}

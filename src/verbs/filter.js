import { _derive } from './derive.js';
import { parse } from '../expression/parse.js';
import { BitSet } from '../table/BitSet.js';

export function filter(table, criteria) {
  const test = parse({ p: criteria }, { table });
  let predicate = test.exprs[0];
  if (test.ops.length) {
    const data = _derive(table, test, { drop: true }).column('p');
    predicate = row => data.at(row);
  }
  return _filter(table, predicate);
}

export function _filter(table, predicate) {
  const n = table.totalRows();
  const bits = table.mask();
  const data = table.data();
  const filter = new BitSet(n);

  // inline the following for performance:
  // table.scan((row, data) => { if (predicate(row, data)) filter.set(row); });
  if (bits) {
    for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
      if (predicate(i, data)) filter.set(i);
    }
  } else {
    for (let i = 0; i < n; ++i) {
      if (predicate(i, data)) filter.set(i);
    }
  }

  return table.create({ filter });
}

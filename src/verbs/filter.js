import _derive from '../engine/derive';
import _filter from '../engine/filter';
import parse from '../expression/parse';

export default function(table, criteria) {
  const test = parse({ test: criteria }, { table });
  let predicate = test.exprs[0];
  if (test.ops.length) {
    const bv = _derive(table, test, { drop: true }).column('test');
    predicate = row => bv.get(row);
  }
  return _filter(table, predicate);
}
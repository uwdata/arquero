import _derive from '../engine/derive';
import _filter from '../engine/filter';
import parse from '../expression/parse';

export default function(table, criteria) {
  const test = parse({ p: criteria }, { table });
  let predicate = test.exprs[0];
  if (test.ops.length) {
    const { data } = _derive(table, test, { drop: true }).column('p');
    predicate = row => data[row];
  }
  return _filter(table, predicate);
}
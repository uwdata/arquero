import _derive from '../engine/derive';
import _filter from '../engine/filter';
import parse from '../expression/parse';

export default function(table, criteria) {
  const expr = parse({ test: criteria });
  let { test } = expr.values;
  if (expr.ops.length) {
    const bv = _derive(table, expr).column('test');
    test = row => bv.get(row);
  }
  return _filter(table, test);
}
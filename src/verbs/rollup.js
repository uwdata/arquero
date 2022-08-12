import _rollup from '../engine/rollup';
import parse from '../expression/parse';

export default function(table, values) {
  return _rollup(table, parse(values, { table, aggronly: true, window: false }));
}
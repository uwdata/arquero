import _rollup from '../engine/rollup.js';
import parse from '../expression/parse.js';

export default function(table, values) {
  return _rollup(table, parse(values, { table, aggronly: true, window: false }));
}

import _fulfill from '../engine/fulfill';
import _rollup from '../engine/rollup';
import parse from './expr/parse';
import { unique } from '../op/op-api';

export default function(table, keys) {
  const params = parse('fulfill', table, keys, { preparse });
  const arrays = _rollup(table.ungroup(), params);
  const { names } = params;
  return _fulfill(table, names, names.map(name => arrays.get(name, 0)));
}

// map direct field reference to "unique" aggregate
function preparse(map) {
  map.forEach((value, key) =>
    value.field ? map.set(key, unique(value + '')) : 0
  );
}
import _lookup from '../engine/lookup';
import parseKey from './expr/parse-key';
import parseValues from './expr/parse';

export default function(tableL, tableR, [keyL, keyR], values) {
  return _lookup(
    tableL,
    tableR,
    [ parseKey('lookup', tableL, keyL), parseKey('lookup', tableR, keyR) ],
    parseValues('lookup', tableR, values)
  );
}
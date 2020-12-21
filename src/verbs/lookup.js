import _lookup from '../engine/lookup';
import { inferKeys } from './join';
import parseKey from './expr/parse-key';
import parseValues from './expr/parse';

export default function(tableL, tableR, on, values) {
  on = inferKeys(tableL, tableR, on);
  return _lookup(
    tableL,
    tableR,
    [ parseKey('lookup', tableL, on[0]), parseKey('lookup', tableR, on[1]) ],
    parseValues('lookup', tableR, values)
  );
}
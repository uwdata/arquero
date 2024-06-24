import _lookup from '../engine/lookup.js';
import { inferKeys } from './util/join-keys.js';
import parseKey from './util/parse-key.js';
import parseValues from './util/parse.js';

export default function(tableL, tableR, on, values) {
  on = inferKeys(tableL, tableR, on);
  return _lookup(
    tableL,
    tableR,
    [ parseKey('lookup', tableL, on[0]), parseKey('lookup', tableR, on[1]) ],
    parseValues('lookup', tableR, values)
  );
}

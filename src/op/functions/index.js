import { bin } from './bin.js';
import { equal } from './equal.js';
import { recode } from './recode.js';
import { sequence } from './sequence.js';

import * as array from './array.js';
import * as date from './date.js';
import * as json from './json.js';
import * as math from './math.js';
import * as object from './object.js';
import * as string from './string.js';

export const functions = {
  bin,
  equal,
  recode,
  sequence,
  ...array,
  ...date,
  ...json,
  ...math,
  ...object,
  ...string
};

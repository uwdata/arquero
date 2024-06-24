import array from './array.js';
import bin from './bin.js';
import date from './date.js';
import equal from './equal.js';
import json from './json.js';
import math from './math.js';
import object from './object.js';
import recode from './recode.js';
import sequence from './sequence.js';
import string from './string.js';

export default {
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

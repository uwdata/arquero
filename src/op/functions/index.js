import array from './array';
import bin from './bin';
import date from './date';
import equal from './equal';
import math from './math';
import object from './object';
import sequence from './sequence';
import string from './string';

export default {
  bin,
  equal,
  sequence,
  ...array,
  ...date,
  ...math,
  ...object,
  ...string
};
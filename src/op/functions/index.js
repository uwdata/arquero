import array from './array';
import bin from './bin';
import date from './date';
import equal from './equal';
import json from './json';
import math from './math';
import object from './object';
import recode from './recode';
import sequence from './sequence';
import string from './string';

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
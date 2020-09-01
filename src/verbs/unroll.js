import _unroll from '../engine/unroll';
import parse from './expr/parse';
import toArray from '../util/to-array';

export default function(table, values, options) {
  return _unroll(table, parse('unroll', table, toArray(values)), options);
}
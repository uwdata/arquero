import _fold from '../engine/fold';
import parse from './expr/parse';
import toArray from '../util/to-array';

export default function(table, values, options) {
  return _fold(table, parse('fold', table, toArray(values)), options);
}
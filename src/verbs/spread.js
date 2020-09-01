import _spread from '../engine/spread';
import parse from './expr/parse';
import toArray from '../util/to-array';

export default function(table, values, options) {
  return _spread(table, parse('spread', table, toArray(values)), options);
}
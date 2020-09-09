import _spread from '../engine/spread';
import parse from './expr/parse';

export default function(table, values, options) {
  return _spread(table, parse('spread', table, values), options);
}
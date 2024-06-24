import _spread from '../engine/spread.js';
import parse from './util/parse.js';

export default function(table, values, options) {
  return _spread(table, parse('spread', table, values), options);
}

import _fold from '../engine/fold.js';
import parse from './util/parse.js';

export default function(table, values, options) {
  return _fold(table, parse('fold', table, values), options);
}

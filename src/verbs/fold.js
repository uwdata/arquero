import _fold from '../engine/fold';
import parse from './expr/parse';

export default function(table, values, options) {
  return _fold(table, parse('fold', table, values), options);
}
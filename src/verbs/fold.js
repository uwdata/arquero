import _fold from '../engine/fold';
import parse from './util/parse';

export default function(table, values, options) {
  return _fold(table, parse('fold', table, values), options);
}
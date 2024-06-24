import _groupby from '../engine/groupby.js';
import parse from './util/parse.js';

export default function(table, values) {
  return _groupby(table, parse('groupby', table, values));
}

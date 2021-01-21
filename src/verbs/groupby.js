import _groupby from '../engine/groupby';
import parse from './util/parse';

export default function(table, values) {
  return _groupby(table, parse('groupby', table, values));
}
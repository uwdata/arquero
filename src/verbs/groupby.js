import _groupby from '../engine/groupby';
import parse from './expr/parse';

export default function(table, values) {
  return _groupby(table, parse('groupby', table, values));
}
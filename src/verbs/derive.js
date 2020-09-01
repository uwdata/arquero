import _derive from '../engine/derive';
import parse from '../expression/parse';

export default function(table, values) {
  return _derive(table, parse(values));
}
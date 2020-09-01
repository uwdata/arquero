import _rollup from '../engine/rollup';
import parse from '../expression/parse';

export default function(table, values) {
  // TODO: parser should enforce no column refs in output values
  return _rollup(table, parse(values));
}
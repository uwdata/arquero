import _unroll from '../engine/unroll';
import parse from './expr/parse';

export default function(table, values, options) {
  return _unroll(
    table,
    parse('unroll', table, values),
    options && options.drop
      ? { ...options, drop: parse('unroll', table, options.drop).names }
      : options
  );
}
import NULL from '../../util/null';
import isArrayType from '../../util/is-array-type';
import isString from '../../util/is-string';
import isValid from '../../util/is-valid';

const Arr = (seq) => isArrayType(seq) ? seq : null;
const Seq = (seq) => (isArrayType(seq) || isString(seq)) ? seq : null;

export default {
  compact:     (array) => Arr(array).filter(v => isValid(v)),
  concat:      (...values) => [].concat(...values),
  includes:    (seq, value, index) => Seq(seq).includes(value, index),
  indexof:     (seq, value) => Seq(seq).indexOf(value),
  join:        (array, delim) => Arr(array).join(delim),
  lastindexof: (seq, value) => Seq(seq).lastIndexOf(value),
  length:      (seq) => seq.length,
  pluck:       (array, prop) => Arr(array).map(v => isValid(v) ? v[prop] : NULL),
  reverse:     (array) => Arr(array).slice().reverse(),
  slice:       (seq, start, end) => Seq(seq).slice(start, end)
};
import isArray from '../../util/is-array';
import isString from '../../util/is-string';
import isTypedArray from '../../util/is-typed-array';
import isValid from '../../util/is-valid';

const Arrays = (seq) => isArray(seq) || isTypedArray(seq) ? seq : null;
const Seq = (seq) => Arrays(seq) || (isString(seq) ? seq : null);

export default {
  concat:       (...values) => [].concat(...values),
  includes:     (seq, value, index) => Seq(seq).includes(value, index),
  indexof:      (seq, value) => Seq(seq).indexOf(value),
  join:         (array, delim) => Arrays(array).join(delim),
  lastindexof:  (seq, value) => Seq(seq).lastIndexOf(value),
  length:       (seq) => seq.length,
  pluck:        (array, property) => Arrays(array)
                  .map(v => isValid(v)? v[property] : undefined),
  reverse:      (array) => Arrays(array).slice().reverse(),
  slice:        (seq, start, end) => Seq(seq).slice(start, end)
};
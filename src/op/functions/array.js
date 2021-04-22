import NULL from '../../util/null';
import isArrayType from '../../util/is-array-type';
import isString from '../../util/is-string';
import isValid from '../../util/is-valid';

const isSeq = (seq) => isArrayType(seq) || isString(seq);

export default {
  compact:      (arr) => isArrayType(arr) ? arr.filter(v => isValid(v)) : arr,
  concat:       (...values) => [].concat(...values),
  includes:     (seq, value, index) => isSeq(seq)
                  ? seq.includes(value, index)
                  : false,
  indexof:      (seq, value) => isSeq(seq) ? seq.indexOf(value) : -1,
  join:         (arr, delim) => isArrayType(arr) ? arr.join(delim) : NULL,
  lastindexof:  (seq, value) => isSeq(seq) ? seq.lastIndexOf(value) : -1,
  length:       (seq) => isSeq(seq) ? seq.length : 0,
  pluck:        (arr, prop) => isArrayType(arr)
                  ? arr.map(v => isValid(v) ? v[prop] : NULL)
                  : NULL,
  reverse:      (seq) => isArrayType(seq) ? seq.slice().reverse()
                  : isString(seq) ? seq.split('').reverse().join('')
                  : NULL,
  slice:        (seq, start, end) => isSeq(seq) ? seq.slice(start, end) : NULL
};

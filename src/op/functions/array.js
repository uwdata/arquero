export default {
  concat:      (...values) => [].concat(...values),
  join:        (array, delim) => array.join(delim),
  includes:    (seq, value, index) => seq.includes(value, index),
  indexof:     (seq, value) => seq.indexOf(value),
  lastindexof: (seq, value) => seq.lastIndexOf(value),
  length:      (seq) => seq.length,
  pluck:       (array, property) => array.map(v => v[property]),
  slice:       (seq, start, end) => seq.slice(start, end),
  reverse:     (array) => array.slice().reverse()
};
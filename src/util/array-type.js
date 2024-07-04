import isTypedArray from './is-typed-array.js';

export default function(column) {
  return isTypedArray(column) ? column.constructor : Array;
}

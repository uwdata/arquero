import isTypedArray from './is-typed-array';

export default function(column) {
  return isTypedArray(column.data) ? column.data.constructor : Array;
}
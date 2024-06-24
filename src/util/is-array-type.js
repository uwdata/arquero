import isArray from './is-array.js';
import isTypedArray from './is-typed-array.js';

export default function isArrayType(value) {
  return isArray(value) || isTypedArray(value);
}

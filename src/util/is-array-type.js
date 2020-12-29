import isArray from './is-array';
import isTypedArray from './is-typed-array';

export default function isArrayType(value) {
  return isArray(value) || isTypedArray(value);
}
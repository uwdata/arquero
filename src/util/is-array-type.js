import { isArray } from './is-array.js';
import { isTypedArray } from './is-typed-array.js';

/**
 * @param {*} value
 * @return {value is (any[] | import('../table/types.js').TypedArray)}
 */
export function isArrayType(value) {
  return isArray(value) || isTypedArray(value);
}

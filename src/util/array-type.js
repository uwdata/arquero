import { isTypedArray } from './is-typed-array.js';

/**
 * @param {*} column
 * @returns {ArrayConstructor | import('../table/types.js').TypedArrayConstructor}
 */
export function arrayType(column) {
  // @ts-ignore
  return isTypedArray(column) ? column.constructor : Array;
}

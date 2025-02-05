const TypedArray = Object.getPrototypeOf(Int8Array);

/**
 * @param {*} value
 * @return {value is import("../table/types.js").TypedArray}
 */
export function isTypedArray(value) {
  return value instanceof TypedArray;
}

const TypedArray = Object.getPrototypeOf(Int8Array);

/**
 * @param {*} value
 * @return {value is import("../table/types.js").TypedArray}
 */
export default function(value) {
  return value instanceof TypedArray;
}

/**
 * @param {*} value
 * @returns {value is RegExp}
 */
export function isRegExp(value) {
  return value instanceof RegExp;
}

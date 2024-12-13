/**
 * @param {*} value
 * @returns {value is bigint}
 */
export function isBigInt(value) {
  return typeof value === 'bigint';
}

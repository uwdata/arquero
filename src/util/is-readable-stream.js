/**
 * @param {*} value
 * @returns {value is ReadableStream}
 */
export function isReadableStream(value) {
  return value instanceof ReadableStream;
}

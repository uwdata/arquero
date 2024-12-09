/**
 * @param {*} value
 * @returns {value is ReadableStream}
 */
export default function(value) {
  return value instanceof ReadableStream;
}

import toArray from '../../util/to-array.js';

/**
 * Create a ReadableStream over provided text data.
 * @param {string|string[]|ReadableStream<string>} text The text or
 *  text array to stream. If this input is already a ReadableStream
 *  it is returned as-is.
 * @returns {ReadableStream<string>}
 */
export function toTextStream(text) {
  if (text instanceof ReadableStream) {
    return text;
  } else {
    return new ReadableStream({
      start(controller) {
        toArray(text).forEach(str => controller.enqueue(str));
        controller.close();
      }
    });
  }
}

/**
 * Create a ReadableStream over provided text data.
 * @param {string} text
 * @param {number} stride
 * @returns {ReadableStream<string>}
 */
export function textStream(text, stride = text.length) {
  return new ReadableStream({
    start(controller) {
      for (let i = 0; i < text.length; i += stride) {
        controller.enqueue(text.slice(i, i + stride));
      }
      controller.close();
    }
  });
}

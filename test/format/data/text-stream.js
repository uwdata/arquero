/**
 * Create a ReadableStream over provided text data.
 * @param {string} text
 * @returns {ReadableStream<string>}
 */
export function textStream(text) {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(text);
      controller.close();
    }
  });
}

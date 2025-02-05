/**
 * Returns a fixed text stream transformer.
 * @param {[number, number][]} positions The fixed positions delimiting records
 * @returns {Transformer<string[], string[][]>}
 */
export function fixedTextTransformer(positions) {
  return {
    start() {}, // no-op
    flush() {}, // no-op
    transform(chunk, controller) {
      controller.enqueue(
        chunk.map(
          line => positions.map(([i, j]) => line.slice(i, j).trim())
        )
      );
    }
  };
}

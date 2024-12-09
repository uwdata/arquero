/**
 * @extends {TransformStream<string[],string[][]>}
 */
export class FixedTextStream extends TransformStream {
  /**
   * @param {[number, number][]} positions
   */
  constructor(positions) {
    super({
      start() {}, // no-op
      flush() {}, // no-op
      transform(chunk, controller) {
        controller.enqueue(
          chunk.map(
            line => positions.map(([i, j]) => line.slice(i, j).trim())
          )
        );
      }
    });
  }
}

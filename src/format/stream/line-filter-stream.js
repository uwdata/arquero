import { BitSet } from '../../table/BitSet.js';
import { identity } from '../../util/identity.js';

/**
 * @template T
 * @param {number} [skip]
 * @param {string} [comment]
 * @param {(value: T) => string} [accessor]
 * @returns {LineFilterStream<T[]> | null}
 */
export function lineFilter(skip, comment, accessor = identity) {
  const drop = shouldDrop(skip, comment, accessor);
  return drop ? new LineFilterStream(drop) : null;
}

function shouldDrop(skip, comment, accessor) {
  return skip > 0
    ? (comment
        ? (t, i) => i < skip || accessor(t).startsWith(comment)
        : (t, i) => i < skip)
    : comment ? t => accessor(t).startsWith(comment)
    : null;
}

/**
 * @template T
 * @extends {TransformStream<T[],T[]>}
 */
export class LineFilterStream extends TransformStream {
  /**
   * @param {(line: T, index: number) => boolean} drop
   */
  constructor(drop) {
    let i = 0;
    super({
      start() {}, // no-op
      flush() {}, // no-op
      transform(chunk, controller) {
        const n = chunk.length;
        const bits = new BitSet(n);
        for (let c = 0; c < chunk.length; ++c, ++i) {
          if (drop(chunk[c], i)) bits.set(i);
        }
        controller.enqueue(
          bits.count()
            ? chunk.filter((_, i) => !bits.get(i))
            : chunk
        );
      }
    });
  }
}

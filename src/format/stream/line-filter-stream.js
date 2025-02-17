import { BitSet } from '../../table/BitSet.js';
import { identity } from '../../util/identity.js';

/**
 * @template T
 * @param {number} [skip]
 * @param {string} [comment]
 * @param {(value: T) => string} [accessor]
 * @returns {TransformStream<T[]> | null}
 */
export function lineFilter(skip, comment, accessor) {
  const transform = lineFilterTransformer(skip, comment, accessor);
  return transform ? new TransformStream(transform) : null;
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
 * Returns a new line filter stream transformer.
 * @template T
 * @param {number} [skip]
 * @param {string} [comment]
 * @param {(value: T) => string} [accessor]
 * @returns {Transformer<T[], T[]>}
 */
export function lineFilterTransformer(skip, comment, accessor = identity) {
  const drop = shouldDrop(skip, comment, accessor);
  if (!drop) return null;
  let i = 0;
  return {
    start() {}, // no-op
    flush() {}, // no-op
    transform(chunk, controller) {
      const n = chunk.length;
      const bits = new BitSet(n);
      for (let c = 0; c < chunk.length; ++c, ++i) {
        if (drop(chunk[c], i)) bits.set(c);
      }
      controller.enqueue(
        bits.count()
          ? chunk.filter((_, c) => !bits.get(c))
          : chunk
      );
    }
  };
}

import { isFunction } from '../../util/is-function.js';

/**
 * Return an async iterator for a stream.
 * This method is needed to deal with Safari.
 * @template T
 * @param {ReadableStream<T>} stream
 * @returns {AsyncIterator<T> & AsyncIterable<T>}
 */
export function streamIterator(stream) {
  if (isFunction(stream[Symbol.asyncIterator])) {
    return stream[Symbol.asyncIterator]();
  } else {
    const reader = stream.getReader();
    return {
      next() {
        return /** @type {Promise<IteratorResult<T>>} */ (reader.read());
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
}

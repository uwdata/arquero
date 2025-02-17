import { isReadableStream } from '../../util/is-readable-stream.js';
import { isString } from '../../util/is-string.js';
import { streamIterator } from './stream-iterator.js';

/**
 * @param {ReadableStream<Uint8Array>} input
 * @returns {Promise<Uint8Array>}
 */
export async function collectBytes(input) {
  const bytes = [];
  let size = 0;
  for await (const chunk of streamIterator(input)) {
    size += chunk.length;
    bytes.push(chunk);
  }
  let buffer;
  if (bytes.length > 1) {
    buffer = new Uint8Array(size);
    for (let i = 0, off = 0; i < bytes.length; ++i) {
      buffer.set(bytes[i], off);
      off += bytes[i].length;
    }
  } else {
    buffer = bytes[0];
  }
  return buffer;
}

/**
 * @param {any} input
 */
export async function collectJSON(input) {
  return isString(input) ? JSON.parse(input)
    : isReadableStream(input) ? JSON.parse(await collectText(input))
    : input;
}

/**
 * @param {ReadableStream<string> | string} input
 * @returns {Promise<string>}
 */
export async function collectText(input) {
  if (isString(input)) return input;
  let text = '';
  for await (const chunk of streamIterator(input)) {
    text += chunk;
  }
  return text;
}

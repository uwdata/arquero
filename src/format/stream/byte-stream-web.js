import { compressionType } from './compression-type.js';

/**
 * Return a ReadableStream for the given URL path.
 * @param {string} url The URL to load.
 * @param {import('../types.js').LoadOptions} options
 * @returns {Promise<ReadableStream<Uint8Array>>}
 */
export async function byteStream(url, {
  fetch: fopt = undefined,
  decompress = compressionType(url)
} = {}) {
  const s = await fetch(url, fopt).then(r => r.body);
  return /** @type {ReadableStream<Uint8Array>} */(decompress
    ? s.pipeThrough(new DecompressionStream(decompress))
    : s);
}

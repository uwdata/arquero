import { open } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { compressionType } from './compression-type.js';

/**
 * Return a ReadableStream of bytes for the give file or URL path.
 * @param {string} path
 * @param {import('../types.js').LoadOptions} options
 * @returns {Promise<ReadableStream<Uint8Array>>}
 */
export async function byteStream(path, {
  fetch: fopt = undefined,
  decompress = compressionType(path)
} = {}) {
  const isFileURL = path.startsWith('file://');
  let p;
  if (/^([A-Za-z]+:)?\/\//.test(path) && !isFileURL) {
    p = fetch(path, fopt).then(r => r.body);
  } else {
    const f = isFileURL ? new URL(path) : path;
    p = open(f).then(fd => Readable.toWeb(fd.createReadStream()));
  }
  const s = await p;
  return /** @type {ReadableStream<Uint8Array>} */(decompress
    // @ts-ignore (void vs. undefined) difference in node stream lib
    ? s.pipeThrough(new DecompressionStream(decompress))
    : s);
}

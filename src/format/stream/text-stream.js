import { byteStream } from './byte-stream.js';

/**
 * Return a Promise to a ReadableStream of text for a given file/url path.
 * @param {string} path The file or URL path
 * @param {import('../types.js').LoadOptions} options
 * @returns {Promise<ReadableStream<string>>}
 */
export async function textStream(path, options) {
  return (await byteStream(path, options))
    .pipeThrough(new TextDecoderStream());
}

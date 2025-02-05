/**
 * Run a stream data through a pipeline of stream transformers.
 * @template T
 * @param {ReadableStream<T>} source
 * @param {(Transformer|null)[]} transformers
 * @returns {any}
 */
export function pipelineStream(source, transformers) {
  let stream = source;
  transformers.forEach(t => {
    if (t) stream = stream.pipeThrough(new TransformStream(t));
  });
  return stream;
}

/**
 * Synchronously run a batch of data through a pipeline of stream transformers.
 * @template T
 * @param {T} source
 * @param {(Transformer|null)[]} transformers
 * @returns {any}
 */
export function pipelineSync(source, transformers) {
  /** @type {any} */
  let data = source;
  let chunks;

  /** @type {TransformStreamDefaultController} */
  const controller = {
    desiredSize: -1,
    error(reason) { throw new Error(reason); },
    terminate() {},
    enqueue(chunk) { chunks.push(chunk); }
  };

  transformers.forEach(t => {
    if (t == null) return;
    chunks = [];
    t.start(controller);
    t.transform(data, controller);
    t.flush(controller);
    data = chunks.flat();
  });
  return data;
}

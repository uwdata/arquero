/**
 * @template T
 * @param {ReadableStream<T>} source
 * @param  {(TransformStream|null)[]} transforms
 */
export function pipeline(source, transforms) {
  let stream = source;
  transforms.forEach(t => {
    if (t) stream = stream.pipeThrough(t);
  });
  return stream;
}

export default function(start, stop, step) {
  let n = arguments.length;
  start = +start;
  stop = +stop;
  step = n < 2
    ? (stop = start, start = 0, 1)
    : n < 3 ? 1 : +step;

  n = Math.max(0, Math.ceil((stop - start) / step)) | 0;
  const seq = new Array(n);

  for (let i = 0; i < n; ++i) {
    seq[i] = start + i * step;
  }

  return seq;
}
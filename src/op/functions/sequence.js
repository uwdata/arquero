/**
 * Returns an array containing an arithmetic sequence from the start value
 * to the stop value, in step increments. If step is positive, the last
 * element is the largest start + i * step less than stop; if step is
 * negative, the last element is the smallest start + i * step greater
 * than stop. If the returned array would contain an infinite number of
 * values, an empty range is returned.
 * @param {number} [start=0] The starting value of the sequence.
 * @param {number} [stop] The stopping value of the sequence.
 *  The stop value is exclusive; it is not included in the result.
 * @param {number} [step=1] The step increment between sequence values.
 * @return {number[]} The generated sequence.
 */
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
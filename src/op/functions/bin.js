/**
 * Truncate a value to a bin boundary.
 * Useful for creating equal-width histograms.
 * Values outside the [min, max] range will be mapped to
 * -Infinity (< min) or +Infinity (> max).
 * @param {number} value - The value to bin.
 * @param {number} min - The minimum bin boundary.
 * @param {number} max - The maximum bin boundary.
 * @param {number} step - The step size between bin boundaries.
 * @param {number} [offset=0] - Offset in steps by which to adjust
 *  the bin value. An offset of 1 will return the next boundary.
 */
export default function(value, min, max, step, offset) {
  return value == null ? null
    : value < min ? -Infinity
    : value > max ? +Infinity
    : (
        value = Math.max(min, Math.min(value, max)),
        min + step * Math.floor(1e-14 + (value - min) / step + (offset || 0))
      );
}
import { formatDate, formatUTCDate } from '../../util/format-date.js';
import { isDate } from '../../util/is-date.js';
import { isFunction } from '../../util/is-function.js';
import { isTypedArray } from '../../util/is-typed-array.js';

/**
 * Format a value as a string.
 * @param {*} v The value to format.
 * @param {import('../types.js').ValueFormatOptions} options Formatting options.
 * @return {string} The formatted string.
 */
export function formatValue(v, options = {}) {
  if (isFunction(options)) {
    // @ts-ignore
    return options(v) + '';
  }

  const type = typeof v;

  if (type === 'object') {
    if (isDate(v)) {
      // @ts-ignore
      return options.utc ? formatUTCDate(v) : formatDate(v);
    } else {
      const s = JSON.stringify(
        v,
        // @ts-ignore
        (k, v) => isTypedArray(v) ? Array.from(v) : v
      );
      // @ts-ignore
      const maxlen = options.maxlen || 30;
      return s.length > maxlen
        ? s.slice(0, 28) + '\u2026' + (s[0] === '[' ? ']' : '}')
        : s;
    }
  } else if (type === 'number') {
    // @ts-ignore
    const digits = options.digits || 0;
    let a;
    return v !== 0 && ((a = Math.abs(v)) >= 1e18 || a < Math.pow(10, -digits))
      ? v.toExponential(digits)
      : v.toFixed(digits);
  } else {
    return v + '';
  }
}

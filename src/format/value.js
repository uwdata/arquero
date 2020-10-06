import { formatDate, formatUTCDate } from '../util/format-date';
import isDate from '../util/is-date';
import isFunction from '../util/is-function';
import isTypedArray from '../util/is-typed-array';

export default function(v, options = {}) {
  if (isFunction(options)) {
    return options(v) + '';
  }

  const type = typeof v;

  if (type === 'object') {
    if (isDate(v)) {
      return options.utc ? formatUTCDate(v) : formatDate(v);
    } else {
      const s = JSON.stringify(
        v,
        (k, v) => isTypedArray(v) ? Array.from(v) : v
      );
      const maxlen = options.maxlen || 30;
      return s.length > maxlen
        ? s.slice(0, 28) + '\u2026' + (s[0] === '[' ? ']' : '}')
        : s;
    }
  } else if (type === 'number') {
    const digits = options.digits || 0;
    let a;
    return v !== 0 && ((a = Math.abs(v)) >= 1e18 || a < Math.pow(10, -digits))
      ? v.toExponential(digits)
      : v.toFixed(digits);
  } else {
    return v + '';
  }
}
import isDate from '../util/is-date';
import isFunction from '../util/is-function';
import isTypedArray from '../util/is-typed-array';

const pad = v => (v < 10 ? '0' : '') + v;

const dateString = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

const timeString = (H, M, S) => `${pad(H)}:${pad(M)}:${pad(S)}`;

const formatDateUTC = d =>
  dateString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());

const formatDate = d =>
  dateString(d.getFullYear(), d.getMonth() + 1, d.getDate());

const formatTime = d =>
  timeString(d.getHours(), d.getMinutes(), d.getSeconds());

const formatDateTime = d => formatDate(d) + ' ' + formatTime(d);

export default function(v, options = {}) {
  if (isFunction(options)) {
    return options(v) + '';
  }

  const type = typeof v;

  if (type === 'object') {
    if (isDate(v)) {
      return options.date === 'utc' ? formatDateUTC(v) + ' UTC'
        : options.date === 'loc' ? formatDate(v)
        : formatDateTime(v);
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
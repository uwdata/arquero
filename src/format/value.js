import isArray from '../util/is-array';
import isDate from '../util/is-date';
import isTypedArray from '../util/is-typed-array';

const dateString = (y, m, d) =>
  `${y}-${(m < 10 ? '0' : '') + m}-${(d < 10 ? '0' : '') + d}`;

const formatDateUTC = d =>
  dateString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());

const formatDate = d =>
  dateString(d.getFullYear(), d.getMonth() + 1, d.getDate());

const formatDateTime = d => d.toISOString();

export default function(v, options = {}) {
  const type = typeof v;

  if (type === 'object') {
    if (isDate(v)) {
      return options.date === 'utc' ? formatDateUTC(v)
        : options.date === 'loc' ? formatDate(v)
        : formatDateTime(v);
    } else {
      v = isTypedArray(v) ? Array.from(v) : v;
      let o = JSON.stringify(v);
      if (o.length > 30) {
        o = o.slice(0, 28) + '\u2026' + (isArray(v) ? ']' : '}');
      }
      return o;
    }
  } else if (type === 'number') {
    return v.toFixed(options.digits);
  } else {
    return v + '';
  }
}
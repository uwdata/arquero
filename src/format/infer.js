import isDate from '../util/is-date';

function isExactDateUTC(d) {
  return d.getUTCHours() === 0
    && d.getUTCMinutes() === 0
    && d.getUTCSeconds() === 0
    && d.getUTCMilliseconds() === 0;
}

export default function(scan, options = {}) {
  let count = 0;
  let nulls = 0;
  let dates = 0;
  let dutcs = 0;
  let nums = 0;
  let digits = 0;

  scan(value => {
    ++count;
    if (value == null) {
      ++nulls;
      return;
    }

    const type = typeof value;
    if (type === 'object' && isDate(value)) {
      ++dates;
      if (isExactDateUTC(value)) ++dutcs;
    } else if (type === 'number') {
      ++nums;
      if (value === value &&  (value | 0) !== value) {
        const s = value + '';
        const p = s.indexOf('.');
        if (p >= 0) {
          const e = s.indexOf('e');
          const l = e > 0 ? e : s.length;
          digits = Math.max(digits, l - p - 1);
        }
      }
    }
  });

  return {
    align:  (nulls + nums + dates) / count > 0.5 ? 'r' : 'l',
    format: {
      utc:    dates === dutcs,
      digits: Math.min(digits, options.maxdigits || 6)
    }
  };
}
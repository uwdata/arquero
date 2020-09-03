import isDate from '../util/is-date';

function isExactDate(d) {
  return d.getHours() === 0
    && d.getMinutes() === 0
    && d.getSeconds() === 0
    && d.getMilliseconds() === 0;
}

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
  let dlocs = 0;
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
      if (isExactDate(value)) ++dlocs;
      if (isExactDateUTC(value)) ++dutcs;
    } else if (type === 'number') {
      ++nums;
      if (value === value &&  (value | 0) !== value) {
        const s = value + '';
        const p = s.indexOf('.');
        digits = Math.max(digits, p >= 0 ? s.length - p - 1 : 0);
      }
    }
  });

  return {
    align:  (nulls + nums + dates) / count > 0.5 ? 'r' : 'l',
    date:   dates === dutcs ? 'utc' : dates === dlocs ? 'loc' : null,
    digits: Math.min(digits, options.maxdigits || 4)
  };
}
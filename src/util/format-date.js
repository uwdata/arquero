import pad from './pad';

const pad2 = v => (v < 10 ? '0' : '') + v;

const formatYear = year => year < 0 ? '-' + pad(-year, 6)
  : year > 9999 ? '+' + pad(year, 6)
  : pad(year, 4);

export function formatISO(year, month, date, hours, min, sec, ms, utc, short) {
  const suffix = utc ? 'Z' : '';
  return formatYear(year) + '-' + pad2(month + 1) + '-' + pad2(date) + (
    !short || ms ? 'T' + pad2(hours) + ':' + pad2(min) + ':' + pad2(sec) + '.' + pad(ms, 3) + suffix
    : sec ? 'T' + pad2(hours) + ':' + pad2(min) + ':' + pad2(sec) + suffix
    : min || hours || !utc ? 'T' + pad2(hours) + ':' + pad2(min) + suffix
    : ''
  );
}

export function formatDate(d, short) {
  return isNaN(d)
    ? 'Invalid Date'
    : formatISO(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      d.getHours(),
      d.getMinutes(),
      d.getSeconds(),
      d.getMilliseconds(),
      false, short
    );
}

export function formatUTCDate(d, short) {
  return isNaN(d)
    ? 'Invalid Date'
    : formatISO(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds(),
      d.getUTCMilliseconds(),
      true, short
    );
}
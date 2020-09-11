const iso_re = /^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/;

const fix_tz = new Date('2019-01-01T00:00').getHours()
            || new Date('2019-07-01T00:00').getHours();

export default function(value, parse = Date.parse) {
  const m = value.match(iso_re);
  if (m) {
    if (fix_tz && !!m[4] && !m[7]) {
      value = value.replace(/-/g, '/').replace(/T/, ' ');
    }
    value = parse(value);
  }
  return value;
}
export default {
  parse_date:  (str) => new Date(str),
  parse_float: (str) => Number.parseFloat(str),
  parse_int:   (str, radix) => Number.parseInt(str, radix),
  endswith:    (str, search, length) => String(str).endsWith(search, length),
  match:       (regexp, str) => regexp.test(str),
  normalize:   (str, form) => String(str).normalize(form),
  padend:      (str, len, fill) => String(str).padEnd(len, fill),
  padstart:    (str, len, fill) => String(str).padStart(len, fill),
  upper:       (str) => String(str).toUpperCase(),
  lower:       (str) => String(str).toLowerCase(),
  repeat:      (str, num) => String(str).repeat(num),
  replace:     (str, pattern, replacement) => String(str).replace(pattern, String(replacement)),
  substring:   (str, start, end) => String(str).substring(start, end),
  split:       (str, separator, limit) => String(str).split(separator, limit),
  startswith:  (str, search, length) => String(str).startsWith(search, length),
  trim:        (str) => String(str).trim()
};
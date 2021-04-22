export default {
  parse_date:   (str) => str == null ? str : new Date(str),
  parse_float:  (str) => str == null ? str : Number.parseFloat(str),
  parse_int:    (str, radix) => str == null ? str : Number.parseInt(str, radix),
  endswith:     (str, search, length) => str == null ? false
                  : String(str).endsWith(search, length),
  match:        (str, regexp, index) => {
                  const m = str == null ? str : String(str).match(regexp);
                  return index == null || m == null ? m
                    : typeof index === 'number' ? m[index]
                    : m.groups ? m.groups[index]
                    : null;
                },
  normalize:    (str, form) => str == null ? str
                  : String(str).normalize(form),
  padend:       (str, len, fill) => str == null ? str
                  : String(str).padEnd(len, fill),
  padstart:     (str, len, fill) => str == null ? str
                  : String(str).padStart(len, fill),
  upper:        (str) => str == null ? str
                  : String(str).toUpperCase(),
  lower:        (str) => str == null ? str
                  : String(str).toLowerCase(),
  repeat:       (str, num) => str == null ? str
                  : String(str).repeat(num),
  replace:      (str, pattern, replacement) => str == null ? str
                  : String(str).replace(pattern, String(replacement)),
  substring:    (str, start, end) => str == null ? str
                  : String(str).substring(start, end),
  split:        (str, separator, limit) => str == null ? []
                  : String(str).split(separator, limit),
  startswith:   (str, search, length) => str == null ? false
                  : String(str).startsWith(search, length),
  trim:         (str) => str == null ? str
                  : String(str).trim()
};
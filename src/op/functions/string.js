export default {
  parsefloat:  (str) => Number.parseFloat(str),
  parseint:    (str, radix) => Number.parseInt(str, radix),
  endswith:    (str, search, length) => str.endsWith(search, length),
  match:       (regexp, str) => regexp.test(str),
  upper:       (str) => str.toUpperCase(),
  lower:       (str) => str.toLowerCase(),
  replace:     (str, pattern, replacement) => str.replace(pattern, replacement),
  substring:   (str, start, end) => str.substring(start, end),
  split:       (str, separator, limit) => str.split(separator, limit),
  startswith:  (str, search, length) => str.startsWith(search, length),
  trim:        (str) => str.trim()
};
import { identity } from './identity.js';
import { isISODateString } from './is-iso-date-string.js';

const parseBoolean = [ // boolean
  v => (v === 'true') || (v === 'false'),
  v => v === 'false' ? false : true
];

const parseNumber = [ // number
  v => v === 'NaN' || (v = +v) === v,
  v => +v
];

const parseDate = [ // iso date
  isISODateString,
  v => new Date(Date.parse(v))
];

function numberParser(decimal) {
  return decimal && decimal !== '.'
    ? parseNumber.map(f => s => f(s && s.replace(decimal, '.')))
    : parseNumber;
}

export function parseValues(values, options) {
  const { decimal, limit = values.length } = options;
  const types = [parseBoolean, numberParser(decimal), parseDate];
  const n = types.length;
  for (let i = 0; i < n; ++i) {
    const [test, parser] = types[i];
    if (check(values, test, limit)) {
      return parser;
    }
  }
  return identity;
}

function check(values, test, n) {
  for (let i = 0; i < n; ++i) {
    const v = values[i];
    if (v != null && !test(v)) {
      return false;
    }
  }
  return true;
}

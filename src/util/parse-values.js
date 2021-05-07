import identity from './identity';
import isISODateString from './is-iso-date-string';

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

function numberParser(options) {
  const { decimal } = options;
  return decimal && decimal !== '.'
    ? parseNumber.map(f => s => f(s && s.replace(decimal, '.')))
    : parseNumber;
}

export default function(values, options) {
  const types = [parseBoolean, numberParser(options), parseDate];
  const n = types.length;
  for (let i = 0; i < n; ++i) {
    const [test, parser] = types[i];
    if (check(values, test)) {
      return parser;
    }
  }
  return identity;
}

function check(values, test) {
  const n = values.length;
  for (let i = 0; i < n; ++i) {
    const v = values[i];
    if (v != null && !test(v)) {
      return false;
    }
  }
  return true;
}
import identity from './identity';
import isISODateString from './is-iso-date-string';

const TYPES = [
  [ // boolean
    v => (v === 'true') || (v === 'false'),
    v => v === 'false' ? false : true
  ],
  [ // number
    v => v === 'NaN' || (v = +v) === v,
    v => +v
  ],
  [ // iso date
    isISODateString,
    v => new Date(Date.parse(v))
  ]
];

export default function(values) {
  const n = TYPES.length;
  for (let i = 0; i < n; ++i) {
    const [test, parser] = TYPES[i];
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
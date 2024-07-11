import parseIsoDate from './parse-iso-date.js';

export default function(input) {
  const value = input.trim();
  let parsed;

  return !value ? null
    : value === 'true' ? true
    : value === 'false' ? false
    : value === 'NaN' ? NaN
    : !isNaN(parsed = +value) ? parsed
    // @ts-ignore
    : (parsed = parseIsoDate(value, d => new Date(d))) !== value ? parsed
    : input;
}

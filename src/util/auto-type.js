import parseIsoDate from './parse-iso-date';

export default function(input) {
  const value = input.trim();
  let parsed;

  return !value ? null
    : value === 'true' ? true
    : value === 'false' ? false
    : value === 'NaN' ? NaN
    : !isNaN(parsed = +value) ? parsed
    : (parsed = parseIsoDate(value, d => new Date(d))) !== value ? parsed
    : input;
}
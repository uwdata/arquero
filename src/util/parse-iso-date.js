import isISODateString from './is-iso-date-string';

export default function(value, parse) {
  parse = parse ?? Date.parse;
  return isISODateString(value) ? parse(value) : value;
}
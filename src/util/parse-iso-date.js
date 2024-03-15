import isISODateString from './is-iso-date-string';

export default function(value, parse) {
    if (parse === undefined) {
        parse = Date.parse;
    }
  return isISODateString(value) ? parse(value) : value;
}
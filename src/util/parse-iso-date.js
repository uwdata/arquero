import { isISODateString } from './is-iso-date-string.js';

export function parseISODate(value, parse = Date.parse) {
  return isISODateString(value) ? parse(value) : value;
}

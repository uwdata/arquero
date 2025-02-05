import { isArray } from './is-array.js';

export function toArray(value) {
  return value != null
    ? (isArray(value) ? value : [value])
    : [];
}

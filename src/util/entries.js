import { isArray } from './is-array.js';
import { isMap } from './is-map.js';

export function entries(value) {
  return isArray(value) ? value
    : isMap(value) ? value.entries()
    : value ? Object.entries(value)
    : [];
}

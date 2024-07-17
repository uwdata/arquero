import isArray from './is-array.js';
import isMap from './is-map.js';

export default function(value) {
  return isArray(value) ? value
    : isMap(value) ? value.entries()
    : value ? Object.entries(value)
    : [];
}

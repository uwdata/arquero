import isArray from './is-array';
import isMap from './is-map';

export default function(value) {
  return isArray(value) ? value
    : isMap(value) ? value.entries()
    : value ? Object.entries(value)
    : [];
}
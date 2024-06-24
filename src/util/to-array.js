import isArray from './is-array.js';

export default function(value) {
  return value != null
    ? (isArray(value) ? value : [value])
    : [];
}

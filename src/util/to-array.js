import isArray from './is-array';

export default function(value) {
  return value != null
    ? (isArray(value) ? value : [value])
    : [];
}
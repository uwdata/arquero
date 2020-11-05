import isArray from './is-array';

export default function toArray(value) {
  return value != null
    ? (isArray(value) ? value : [value])
    : [];
}
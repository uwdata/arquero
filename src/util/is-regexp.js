import toString from './to-string';

export default function(value) {
  return toString.call(value) === '[object RegExp]';
}
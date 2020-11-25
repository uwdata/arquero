import toString from './object-to-string';

export default function(value) {
  return toString.call(value) === '[object RegExp]';
}
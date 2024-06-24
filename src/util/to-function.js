import isFunction from './is-function.js';

export default function(value) {
  return isFunction(value) ? value : () => value;
}

import { isFunction } from './is-function.js';

export function toFunction(value) {
  return isFunction(value) ? value : () => value;
}

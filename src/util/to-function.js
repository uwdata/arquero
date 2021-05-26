import isFunction from './is-function';

export default function(value) {
  return isFunction(value) ? value : () => value;
}
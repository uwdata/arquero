import isBigInt from './is-bigint.js';

export default function(value) {
  return isBigInt(value) ? value : +value;
}

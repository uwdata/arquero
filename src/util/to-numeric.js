import { isBigInt } from './is-bigint.js';

export function toNumeric(value) {
  return isBigInt(value) ? value : +value;
}

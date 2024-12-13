import { isBigInt } from './is-bigint.js';

export function toString(v) {
  return v === undefined ? v + ''
    : isBigInt(v) ? v + 'n'
    : JSON.stringify(v);
}

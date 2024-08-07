import isBigInt from './is-bigint.js';

export default function(v) {
  return v === undefined ? v + ''
    : isBigInt(v) ? v + 'n'
    : JSON.stringify(v);
}

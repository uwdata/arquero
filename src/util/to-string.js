import isBigInt from './is-bigint';

export default function(v) {
  return v === undefined ? v + ''
    : isBigInt(v) ? v + 'n'
    : JSON.stringify(v);
}
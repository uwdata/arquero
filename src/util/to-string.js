import isBigInt from './is-bigint';

export default function(v) {
  return isBigInt(v)
    ? (v.toString() + 'n')
    : JSON.stringify(v);
}
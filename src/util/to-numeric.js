import isBigInt from './is-bigint';

export default function(value) {
  return isBigInt(value) ? value : +value;
}
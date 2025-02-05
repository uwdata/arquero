import { isBigInt } from './is-bigint.js';
import { NULL } from './null.js';
import { toNumeric } from './to-numeric.js';

export function quantile(values, p) {
  const n = values.length;

  if (!n) return NULL;
  if ((p = +p) <= 0 || n < 2) return toNumeric(values[0]);
  if (p >= 1) return toNumeric(values[n - 1]);

  const i = (n - 1) * p;
  const i0 = Math.floor(i);
  const v0 = toNumeric(values[i0]);
  return isBigInt(v0)
    ? v0
    // @ts-ignore
    : v0 + (toNumeric(values[i0 + 1]) - v0) * (i - i0);
}

import { random } from './random.js';

export function shuffle(array, lo = 0, hi = array.length) {
  let n = hi - (lo = +lo);

  while (n) {
    const i = random() * n-- | 0;
    const v = array[n + lo];
    array[n + lo] = array[i + lo];
    array[i + lo] = v;
  }

  return array;
}

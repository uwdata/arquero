import { NULL } from './null.js';

export function max(values, start = 0, stop = values.length) {
  let max = stop ? values[start++] : NULL;

  for (let i = start; i < stop; ++i) {
    if (max < values[i]) {
      max = values[i];
    }
  }

  return max;
}

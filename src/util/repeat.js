import { isFunction } from './is-function.js';

export function repeat(reps, value) {
  const result = Array(reps);
  if (isFunction(value)) {
    for (let i = 0; i < reps; ++i) {
      result[i] = value(i);
    }
  } else {
    result.fill(value);
  }
  return result;
}

import { performance } from 'perf_hooks';

export function time(fn, ...args) {
  const t0 = performance.now();
  fn(...args);
  return Math.round(performance.now() - t0);
};

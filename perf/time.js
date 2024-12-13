import { performance } from 'perf_hooks';

export async function time(fn, ...args) {
  const t0 = performance.now();
  await fn(...args);
  return Math.round(performance.now() - t0);
};

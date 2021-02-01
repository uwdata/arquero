const { performance } = require('perf_hooks');

module.exports = function time(fn, ...args) {
  const t0 = performance.now();
  fn(...args);
  return Math.round(performance.now() - t0);
};
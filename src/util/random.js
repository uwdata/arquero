let source = Math.random;

export function random() {
  return source();
}

export function seed(seed) {
  const m = 2147483647; // 2^31 - 1
  const a = 1103515245;
  const c = 12345;
  // Random numbers using a Linear Congruential Generator with seed value
  // https://en.wikipedia.org/wiki/Linear_congruential_generator
  source = () => (seed = (a * seed + c) % m) / m;
}
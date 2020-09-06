import isValid from './is-valid';

let source = Math.random;

export function random() {
  return source();
}

/**
 * Set a seed value for random number generation.
 * If the seed is a valid number, a 32-bit linear congruential generator
 * with the given seed will be used to generate random values.
 * If the seed is null, undefined, or not a valid number, the random
 * number generator will revert to Math.random.
 * @param {number} seed The random seed value. Should either be an
 *  integer or a fraction between 0 and 1.
 */
export function seed(seed) {
  source = isValid(seed) && isFinite(seed = +seed) ? lcg(seed) : Math.random;
}

function lcg(seed) {
  const a = 0x19660D;
  const c = 0x3C6EF35F;
  const m = 1 / 0x100000000;
  seed = (0 <= seed && seed < 1 ? seed / m : Math.abs(seed)) | 0;

  // Random numbers using a Linear Congruential Generator with seed value
  // https://en.wikipedia.org/wiki/Linear_congruential_generator
  return () => (seed = a * seed + c | 0, m * (seed >>> 0));
}
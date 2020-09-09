import isDate from '../../util/is-date';
import isRegExp from '../../util/is-regexp';
import isObject from '../../util/is-object';

/**
 * Compare two values for equality, using join semantics in which null
 * !== null. If the inputs are object-valued, a deep equality check
 * of array entries or object key-value pairs is performed.
 * @param {*} a The first input.
 * @param {*} b The second input.
 * @return {boolean} True if equal, false if not.
 */
export default function equal(a, b) {
  return (a == null || b == null || a !== a || b !== b) ? false
    : a === b ? true
    : (isDate(a) || isDate(b)) ? +a === +b
    : (isRegExp(a) && isRegExp(b)) ? a + '' === b + ''
    : (isObject(a) && isObject(b)) ? deepEqual(a, b)
    : false;
}

function deepEqual(a, b) {
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return false;
  }

  if (a.length || b.length) {
    return arrayEqual(a, b);
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) {
    return false;
  }
  keysA.sort();
  keysB.sort();

  if (!arrayEqual(keysA, keysB, (a, b) => a === b)) {
    return false;
  }

  const n = keysA.length;
  for (let i = 0; i < n; ++i) {
    const k = keysA[i];
    if (!equal(a[k], b[k])) {
      return false;
    }
  }

  return true;
}

function arrayEqual(a, b, test = equal) {
  const n = a.length;
  if (n !== b.length) return false;

  for (let i = 0; i < n; ++i) {
    if (!test(a[i], b[i])) {
      return false;
    }
  }

  return true;
}
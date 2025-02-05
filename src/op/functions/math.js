import { random as _random } from '../../util/random.js';

/**
 * Return a random floating point number between 0 (inclusive) and 1
 * (exclusive). By default uses *Math.random*. Use the *seed* method
 * to instead use a seeded random number generator.
 * @return {number} A pseudorandom number between 0 and 1.
 */
export function random() {
  return _random();
}

/**
 * Tests if the input *value* is not a number (`NaN`); equivalent
 * to *Number.isNaN*.
 * @param {*} value The value to test.
 * @return {boolean} True if the value is not a number, false otherwise.
 */
export function is_nan(value) {
  return Number.isNaN(value);
}

/**
 * Tests if the input *value* is finite; equivalent to *Number.isFinite*.
 * @param {*} value The value to test.
 * @return {boolean} True if the value is finite, false otherwise.
 */
export function is_finite(value) {
  return Number.isFinite(value);
}

/**
 * Returns the absolute value of the input *value*; equivalent to *Math.abs*.
 * @param {number} value The input number value.
 * @return {number} The absolute value.
 */
export function abs(value) {
  return Math.abs(value);
}

/**
 * Returns the cube root value of the input *value*; equivalent to
 * *Math.cbrt*.
 * @param {number} value The input number value.
 * @return {number} The cube root value.
 */
export function cbrt(value) {
  return Math.cbrt(value);
}

/**
 * Returns the ceiling of the input *value*, the nearest integer equal to
 * or greater than the input; equivalent to *Math.ceil*.
 * @param {number} value The input number value.
 * @return {number} The ceiling value.
 */
export function ceil(value) {
  return Math.ceil(value);
}

/**
 * Returns the number of leading zero bits in the 32-bit binary
 * representation of a number *value*; equivalent to *Math.clz32*.
 * @param {number} value The input number value.
 * @return {number} The leading zero bits value.
 */
export function clz32(value) {
  return Math.clz32(value);
}

/**
 * Returns *e<sup>value</sup>*, where *e* is Euler's number, the base of the
 * natural logarithm; equivalent to *Math.exp*.
 * @param {number} value The input number value.
 * @return {number} The base-e exponentiated value.
 */
export function exp(value) {
  return Math.exp(value);
}

/**
 * Returns *e<sup>value</sup> - 1*, where *e* is Euler's number, the base of
 * the natural logarithm; equivalent to *Math.expm1*.
 * @param {number} value The input number value.
 * @return {number} The base-e exponentiated value minus 1.
 */
export function expm1(value) {
  return Math.expm1(value);
}

/**
 * Returns the floor of the input *value*, the nearest integer equal to or
 * less than the input; equivalent to *Math.floor*.
 * @param {number} value The input number value.
 * @return {number} The floor value.
 */
export function floor(value) {
  return Math.floor(value);
}

/**
 * Returns the nearest 32-bit single precision float representation of the
 * input number *value*; equivalent to *Math.fround*. Useful for translating
 * between 64-bit `Number` values and values from a `Float32Array`.
 * @param {number} value The input number value.
 * @return {number} The rounded value.
 */
export function fround(value) {
  return Math.fround(value);
}

/**
 * Returns the greatest (maximum) value among the input *values*; equivalent
 * to *Math.max*. This is _not_ an aggregate function, see *op.max* to
 * compute a maximum value across multiple rows.
 * @param {...number} values The input number values.
 * @return {number} The greatest (maximum) value among the inputs.
 */
export function greatest(...values) {
  return Math.max(...values);
}

/**
 * Returns the least (minimum) value among the input *values*; equivalent
 * to *Math.min*. This is _not_ an aggregate function, see *op.min* to
 * compute a minimum value across multiple rows.
 * @param {...number} values The input number values.
 * @return {number} The least (minimum) value among the inputs.
 */
export function least(...values) {
  return Math.min(...values);
}

/**
 * Returns the natural logarithm (base *e*) of a number *value*; equivalent
 * to *Math.log*.
 * @param {number} value The input number value.
 * @return {number} The base-e log value.
 */
export function log(value) {
  return Math.log(value);
}

/**
 * Returns the base 10 logarithm of a number *value*; equivalent
 * to *Math.log10*.
 * @param {number} value The input number value.
 * @return {number} The base-10 log value.
 */
export function log10(value) {
  return Math.log10(value);
}

/**
 * Returns the natural logarithm (base *e*) of 1 + a number *value*;
 * equivalent to *Math.log1p*.
 * @param {number} value The input number value.
 * @return {number} The base-e log of value + 1.
 */
export function log1p(value) {
  return Math.log1p(value);
}

/**
 * Returns the base 2 logarithm of a number *value*; equivalent
 * to *Math.log2*.
 * @param {number} value The input number value.
 * @return {number} The base-2 log value.
 */
export function log2(value) {
  return Math.log2(value);
}

/**
 * Returns the *base* raised to the *exponent* power, that is,
 * *base*<sup>*exponent*</sup>; equivalent to *Math.pow*.
 * @param {number} base The base number value.
 * @param {number} exponent The exponent number value.
 * @return {number} The exponentiated value.
 */
export function pow(base, exponent) {
  return Math.pow(base, exponent);
}

/**
 * Returns the value of a number rounded to the nearest integer;
 * equivalent to *Math.round*.
 * @param {number} value The input number value.
 * @return {number} The rounded value.
 */
export function round(value) {
  return Math.round(value);
}

/**
 * Returns either a positive or negative +/- 1, indicating the sign of the
 * input *value*; equivalent to *Math.sign*.
 * @param {number} value The input number value.
 * @return {number} The sign of the value.
 */
export function sign(value) {
  return Math.sign(value);
}

/**
 * Returns the square root of the input *value*; equivalent to *Math.sqrt*.
 * @param {number} value The input number value.
 * @return {number} The square root value.
 */
export function sqrt(value) {
  return Math.sqrt(value);
}

/**
 * Returns the integer part of a number by removing any fractional digits;
 * equivalent to *Math.trunc*.
 * @param {number} value The input number value.
 * @return {number} The truncated value.
 */
export function trunc(value) {
  return Math.trunc(value);
}

/**
 * Converts the input *radians* value to degrees.
 * @param {number} radians The input radians value.
 * @return {number} The value in degrees
 */
export function degrees(radians) {
  return 180 * radians / Math.PI;
}

/**
 * Converts the input *degrees* value to radians.
 * @param {number} degrees The input degrees value.
 * @return {number} The value in radians.
 */
export function radians(degrees) {
  return Math.PI * degrees / 180;
}

/**
 * Returns the arc-cosine (in radians) of a number *value*;
 * equivalent to *Math.acos*.
 * @param {number} value The input number value.
 * @return {number} The arc-cosine value.
 */
export function acos(value) {
  return Math.acos(value);
}

/**
 * Returns the hyperbolic arc-cosine of a number *value*;
 * equivalent to *Math.acosh*.
 * @param {number} value The input number value.
 * @return {number} The hyperbolic arc-cosine value.
 */
export function acosh(value) {
  return Math.acosh(value);
}

/**
 * Returns the arc-sine (in radians) of a number *value*;
 * equivalent to *Math.asin*.
 * @param {number} value The input number value.
 * @return {number} The arc-sine value.
 */
export function asin(value) {
  return Math.asin(value);
}

/**
 * Returns the hyperbolic arc-sine of a number *value*;
 * equivalent to *Math.asinh*.
 * @param {number} value The input number value.
 * @return {number} The hyperbolic arc-sine value.
 */
export function asinh(value) {
  return Math.asinh(value);
}

/**
 * Returns the arc-tangent (in radians) of a number *value*;
 * equivalent to *Math.atan*.
 * @param {number} value The input number value.
 * @return {number} The arc-tangent value.
 */
export function atan(value) {
  return Math.atan(value);
}

/**
 * Returns the angle in the plane (in radians) between the positive x-axis
 * and the ray from (0, 0) to the point (*x*, *y*);
 * equivalent to *Math.atan2*.
 * @param {number} y The y coordinate of the point.
 * @param {number} x The x coordinate of the point.
 * @return {number} The arc-tangent angle.
 */
export function atan2(y, x) {
  return Math.atan2(y, x);
}

/**
 * Returns the hyperbolic arc-tangent of a number *value*;
 * equivalent to *Math.atanh*.
 * @param {number} value The input number value.
 * @return {number} The hyperbolic arc-tangent value.
 */
export function atanh(value) {
  return Math.atanh(value);
}

/**
 * Returns the cosine (in radians) of a number *value*;
 * equivalent to *Math.cos*.
 * @param {number} value The input number value.
 * @return {number} The cosine value.
 */
export function cos(value) {
  return Math.cos(value);
}

/**
 * Returns the hyperbolic cosine (in radians) of a number *value*;
 * equivalent to *Math.cosh*.
 * @param {number} value The input number value.
 * @return {number} The hyperbolic cosine value.
 */
export function cosh(value) {
  return Math.cosh(value);
}

/**
 * Returns the sine (in radians) of a number *value*;
 * equivalent to *Math.sin*.
 * @param {number} value The input number value.
 * @return {number} The sine value.
 */
export function sin(value) {
  return Math.sin(value);
}

/**
 * Returns the hyperbolic sine (in radians) of a number *value*;
 * equivalent to *Math.sinh*.
 * @param {number} value The input number value.
 * @return {number} The hyperbolic sine value.
 */
export function sinh(value) {
  return Math.sinh(value);
}

/**
 * Returns the tangent (in radians) of a number *value*;
 * equivalent to *Math.tan*.
 * @param {number} value The input number value.
 * @return {number} The tangent value.
 */
export function tan(value) {
  return Math.tan(value);
}

/**
 * Returns the hyperbolic tangent (in radians) of a number *value*;
 * equivalent to *Math.tanh*.
 * @param {number} value The input number value.
 * @return {number} The hyperbolic tangent value.
 */
export function tanh(value) {
  return Math.tanh(value);
}

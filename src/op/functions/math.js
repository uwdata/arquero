import { random } from '../../util/random.js';

export default {
  /**
   * Return a random floating point number between 0 (inclusive) and 1
   * (exclusive). By default uses *Math.random*. Use the *seed* method
   * to instead use a seeded random number generator.
   * @return {number} A pseudorandom number between 0 and 1.
   */
  random,

  /**
   * Tests if the input *value* is not a number (`NaN`); equivalent
   * to *Number.isNaN*.
   * @param {*} value The value to test.
   * @return {boolean} True if the value is not a number, false otherwise.
   */
  is_nan: Number.isNaN,

  /**
   * Tests if the input *value* is finite; equivalent to *Number.isFinite*.
   * @param {*} value The value to test.
   * @return {boolean} True if the value is finite, false otherwise.
   */
  is_finite: Number.isFinite,

  /**
   * Returns the absolute value of the input *value*; equivalent to *Math.abs*.
   * @param {number} value The input number value.
   * @return {number} The absolute value.
   */
  abs: Math.abs,

  /**
   * Returns the cube root value of the input *value*; equivalent to
   * *Math.cbrt*.
   * @param {number} value The input number value.
   * @return {number} The cube root value.
   */
  cbrt: Math.cbrt,

  /**
   * Returns the ceiling of the input *value*, the nearest integer equal to
   * or greater than the input; equivalent to *Math.ceil*.
   * @param {number} value The input number value.
   * @return {number} The ceiling value.
   */
  ceil: Math.ceil,

  /**
   * Returns the number of leading zero bits in the 32-bit binary
   * representation of a number *value*; equivalent to *Math.clz32*.
   * @param {number} value The input number value.
   * @return {number} The leading zero bits value.
   */
  clz32: Math.clz32,

  /**
   * Returns *e<sup>value</sup>*, where *e* is Euler's number, the base of the
   * natural logarithm; equivalent to *Math.exp*.
   * @param {number} value The input number value.
   * @return {number} The base-e exponentiated value.
   */
  exp: Math.exp,

  /**
   * Returns *e<sup>value</sup> - 1*, where *e* is Euler's number, the base of
   * the natural logarithm; equivalent to *Math.expm1*.
   * @param {number} value The input number value.
   * @return {number} The base-e exponentiated value minus 1.
   */
  expm1: Math.expm1,

  /**
   * Returns the floor of the input *value*, the nearest integer equal to or
   * less than the input; equivalent to *Math.floor*.
   * @param {number} value The input number value.
   * @return {number} The floor value.
   */
  floor: Math.floor,

  /**
   * Returns the nearest 32-bit single precision float representation of the
   * input number *value*; equivalent to *Math.fround*. Useful for translating
   * between 64-bit `Number` values and values from a `Float32Array`.
   * @param {number} value The input number value.
   * @return {number} The rounded value.
   */
  fround: Math.fround,

  /**
   * Returns the greatest (maximum) value among the input *values*; equivalent
   * to *Math.max*. This is _not_ an aggregate function, see *op.max* to
   * compute a maximum value across multiple rows.
   * @param {...number} values The input number values.
   * @return {number} The greatest (maximum) value among the inputs.
   */
  greatest: Math.max,

  /**
   * Returns the least (minimum) value among the input *values*; equivalent
   * to *Math.min*. This is _not_ an aggregate function, see *op.min* to
   * compute a minimum value across multiple rows.
   * @param {...number} values The input number values.
   * @return {number} The least (minimum) value among the inputs.
   */
  least: Math.min,

  /**
   * Returns the natural logarithm (base *e*) of a number *value*; equivalent
   * to *Math.log*.
   * @param {number} value The input number value.
   * @return {number} The base-e log value.
   */
  log: Math.log,

  /**
   * Returns the base 10 logarithm of a number *value*; equivalent
   * to *Math.log10*.
   * @param {number} value The input number value.
   * @return {number} The base-10 log value.
   */
  log10: Math.log10,

  /**
   * Returns the natural logarithm (base *e*) of 1 + a number *value*;
   * equivalent to *Math.log1p*.
   * @param {number} value The input number value.
   * @return {number} The base-e log of value + 1.
   */
  log1p: Math.log1p,

  /**
   * Returns the base 2 logarithm of a number *value*; equivalent
   * to *Math.log2*.
   * @param {number} value The input number value.
   * @return {number} The base-2 log value.
   */
  log2: Math.log2,

  /**
   * Returns the *base* raised to the *exponent* power, that is,
   * *base*<sup>*exponent*</sup>; equivalent to *Math.pow*.
   * @param {number} base The base number value.
   * @param {number} exponent The exponent number value.
   * @return {number} The exponentiated value.
   */
  pow: Math.pow,

  /**
   * Returns the value of a number rounded to the nearest integer;
   * equivalent to *Math.round*.
   * @param {number} value The input number value.
   * @return {number} The rounded value.
   */
  round: Math.round,

  /**
   * Returns either a positive or negative +/- 1, indicating the sign of the
   * input *value*; equivalent to *Math.sign*.
   * @param {number} value The input number value.
   * @return {number} The sign of the value.
   */
  sign: Math.sign,

  /**
   * Returns the square root of the input *value*; equivalent to *Math.sqrt*.
   * @param {number} value The input number value.
   * @return {number} The square root value.
   */
  sqrt: Math.sqrt,

  /**
   * Returns the integer part of a number by removing any fractional digits;
   * equivalent to *Math.trunc*.
   * @param {number} value The input number value.
   * @return {number} The truncated value.
   */
  trunc: Math.trunc,

  /**
   * Converts the input *radians* value to degrees.
   * @param {number} radians The input radians value.
   * @return {number} The value in degrees
   */
  degrees: (radians) => 180 * radians / Math.PI,

  /**
   * Converts the input *degrees* value to radians.
   * @param {number} degrees The input degrees value.
   * @return {number} The value in radians.
   */
  radians: (degrees) => Math.PI * degrees / 180,

  /**
   * Returns the arc-cosine (in radians) of a number *value*;
   * equivalent to *Math.acos*.
   * @param {number} value The input number value.
   * @return {number} The arc-cosine value.
   */
  acos: Math.acos,

  /**
   * Returns the hyperbolic arc-cosine of a number *value*;
   * equivalent to *Math.acosh*.
   * @param {number} value The input number value.
   * @return {number} The hyperbolic arc-cosine value.
   */
  acosh: Math.acosh,

  /**
   * Returns the arc-sine (in radians) of a number *value*;
   * equivalent to *Math.asin*.
   * @param {number} value The input number value.
   * @return {number} The arc-sine value.
   */
  asin: Math.asin,

  /**
   * Returns the hyperbolic arc-sine of a number *value*;
   * equivalent to *Math.asinh*.
   * @param {number} value The input number value.
   * @return {number} The hyperbolic arc-sine value.
   */
  asinh: Math.asinh,

  /**
   * Returns the arc-tangent (in radians) of a number *value*;
   * equivalent to *Math.atan*.
   * @param {number} value The input number value.
   * @return {number} The arc-tangent value.
   */
  atan: Math.atan,

  /**
   * Returns the angle in the plane (in radians) between the positive x-axis
   * and the ray from (0, 0) to the point (*x*, *y*);
   * equivalent to *Math.atan2*.
   * @param {number} y The y coordinate of the point.
   * @param {number} x The x coordinate of the point.
   * @return {number} The arc-tangent angle.
   */
  atan2: Math.atan2,

  /**
   * Returns the hyperbolic arc-tangent of a number *value*;
   * equivalent to *Math.atanh*.
   * @param {number} value The input number value.
   * @return {number} The hyperbolic arc-tangent value.
   */
  atanh: Math.atanh,

  /**
   * Returns the cosine (in radians) of a number *value*;
   * equivalent to *Math.cos*.
   * @param {number} value The input number value.
   * @return {number} The cosine value.
   */
  cos: Math.cos,

  /**
   * Returns the hyperbolic cosine (in radians) of a number *value*;
   * equivalent to *Math.cosh*.
   * @param {number} value The input number value.
   * @return {number} The hyperbolic cosine value.
   */
  cosh: Math.cosh,

  /**
   * Returns the sine (in radians) of a number *value*;
   * equivalent to *Math.sin*.
   * @param {number} value The input number value.
   * @return {number} The sine value.
   */
  sin: Math.sin,

  /**
   * Returns the hyperbolic sine (in radians) of a number *value*;
   * equivalent to *Math.sinh*.
   * @param {number} value The input number value.
   * @return {number} The hyperbolic sine value.
   */
  sinh: Math.sinh,

  /**
   * Returns the tangent (in radians) of a number *value*;
   * equivalent to *Math.tan*.
   * @param {number} value The input number value.
   * @return {number} The tangent value.
   */
  tan: Math.tan,

  /**
   * Returns the hyperbolic tangent (in radians) of a number *value*;
   * equivalent to *Math.tanh*.
   * @param {number} value The input number value.
   * @return {number} The hyperbolic tangent value.
   */
  tanh: Math.tanh
};

import { NULL } from '../../util/null.js';
import { isArrayType } from '../../util/is-array-type.js';
import { isString } from '../../util/is-string.js';
import { isValid } from '../../util/is-valid.js';

const isSeq = (seq) => isArrayType(seq) || isString(seq);

/**
 * Returns a new compacted array with invalid values
 * (`null`, `undefined`, `NaN`) removed.
 * @template T
 * @param {T[]} array The input array.
 * @return {T[]} A compacted array.
 */
export function compact(array) {
  return isArrayType(array)
    ? array.filter(v => isValid(v))
    : array;
}

/**
 * Merges two or more arrays in sequence, returning a new array.
 * @template T
 * @param {...(T|T[])} values The arrays to merge.
 * @return {T[]} The merged array.
 */
export function concat(...values) {
  return [].concat(...values);
}

/**
 * Determines whether an *array* includes a certain *value* among its
 * entries, returning `true` or `false` as appropriate.
 * @template T
 * @param {T[]} sequence The input array value.
 * @param {T} value The value to search for.
 * @param {number} [index=0] The integer index to start searching
 *  from (default `0`).
 * @return {boolean} True if the value is included, false otherwise.
 */
export function includes(sequence, value, index) {
  return isSeq(sequence)
    ? sequence.includes(value, index)
    : false;
}

/**
 * Returns the first index at which a given *value* can be found in the
 * *sequence* (array or string), or -1 if it is not present.
 * @template T
 * @param {T[]|string} sequence The input array or string value.
 * @param {T} value The value to search for.
 * @return {number} The index of the value, or -1 if not present.
 */
export function indexof(sequence, value) {
  return isSeq(sequence)
    // @ts-ignore
    ? sequence.indexOf(value)
    : -1;
}

/**
 * Creates and returns a new string by concatenating all of the elements
 * in an *array* (or an array-like object), separated by commas or a
 * specified *delimiter* string. If the *array* has only one item, then
 * that item will be returned without using the delimiter.
 * @template T
 * @param {T[]} array The input array value.
 * @param {string} delim The delimiter string (default `','`).
 * @return {string} The joined string.
 */
export function join(array, delim) {
  return isArrayType(array) ? array.join(delim) : NULL;
}

/**
 * Returns the last index at which a given *value* can be found in the
 * *sequence* (array or string), or -1 if it is not present.
 * @template T
 * @param {T[]|string} sequence The input array or string value.
 * @param {T} value The value to search for.
 * @return {number} The last index of the value, or -1 if not present.
 */
export function lastindexof(sequence, value) {
  return isSeq(sequence)
    // @ts-ignore
    ? sequence.lastIndexOf(value)
    : -1;
}

/**
 * Returns the length of the input *sequence* (array or string).
 * @param {Array|string} sequence The input array or string value.
 * @return {number} The length of the sequence.
 */
export function length(sequence) {
  return isSeq(sequence) ? sequence.length : 0;
}

/**
 * Returns a new array in which the given *property* has been extracted
 * for each element in the input *array*.
 * @param {Array} array The input array value.
 * @param {string} property The property name string to extract. Nested
 *  properties are not supported: the input `"a.b"` will indicates a
 *  property with that exact name, *not* a nested property `"b"` of
 *  the object `"a"`.
 * @return {Array} An array of plucked properties.
 */
export function pluck(array, property) {
  return isArrayType(array)
    ? array.map(v => isValid(v) ? v[property] : NULL)
    : NULL;
}

/**
 * Returns a new array or string with the element order reversed: the first
 * *sequence* element becomes the last, and the last *sequence* element
 * becomes the first. The input *sequence* is unchanged.
 * @template T
 * @param {T[]|string} sequence The input array or string value.
 * @return {T[]|string} The reversed sequence.
 */
export function reverse(sequence) {
  return isArrayType(sequence) ? sequence.slice().reverse()
    : isString(sequence) ? sequence.split('').reverse().join('')
    : NULL;
}

/**
 * Returns a copy of a portion of the input *sequence* (array or string)
 * selected from *start* to *end* (*end* not included) where *start* and
 * *end* represent the index of items in the sequence.
 * @template T
 * @param {T[]|string} sequence The input array or string value.
 * @param {number} [start=0] The starting integer index to copy from
 *  (inclusive, default `0`).
 * @param {number} [end] The ending integer index to copy from (exclusive,
 *  default `sequence.length`).
 * @return {T[]|string} The sliced sequence.
 */
export function slice(sequence, start, end) {
  return isSeq(sequence)
    ? sequence.slice(start, end)
    : NULL;
}

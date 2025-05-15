import { NULL } from '../../util/null.js';
import { isMap } from '../../util/is-map.js';
import { isMapOrSet } from '../../util/is-map-or-set.js';

function array(iter) {
  return Array.from(iter);
}

/**
 * Returns a boolean indicating whether the *object* has the specified *key*
 * as its own property (as opposed to inheriting it). If the *object* is a
 * *Map* or *Set* instance, the *has* method will be invoked directly on the
 * object, otherwise *Object.hasOwnProperty* is used.
 * @template {string | number} K
 * @template V
 * @param {Map<K, V>|Set<K>|Record<K, V>} object The object, Map, or Set to
 *  test for property membership.
 * @param {K} key The property key to test for.
 * @return {boolean} True if the object has the given key, false otherwise.
 */
export function has(object, key) {
  return isMapOrSet(object) ? object.has(key)
    : object != null ? Object.hasOwn(object, `${key}`)
    : false;
}

/**
 * Returns an array of a given *object*'s own enumerable property names. If
 * the *object* is a *Map* instance, the *keys* method will be invoked
 * directly on the object, otherwise *Object.keys* is used.
 * @template {string | number} K
 * @template V
 * @param {Map<K, V>|Record<K, V>} object The input object or Map value.
 * @return {K[]} An array of property key name strings.
 */
export function keys(object) {
  return isMap(object) ? array(object.keys())
    : object != null ? /** @type {K[]} */(Object.keys(object))
    : [];
}

/**
 * Returns an array of a given *object*'s own enumerable property values. If
 * the *object* is a *Map* or *Set* instance, the *values* method will be
 * invoked directly on the object, otherwise *Object.values* is used.
 * @template {string | number} K
 * @template V
 * @param {Map<K, V> | Set<V> | Record<K, V>} object The input object, Map,
 *  or Set value.
 * @return {V[]} An array of property values.
 */
export function values(object) {
  return isMapOrSet(object) ? array(object.values())
    : object != null ? Object.values(object)
    : [];
}

/**
 * Returns an array of a given *object*'s own enumerable keyed property
 * `[key, value]` pairs. If the *object* is a *Map* or *Set* instance, the
 * *entries* method will be invoked directly on the object, otherwise
 * *Object.entries* is used.
 * @template {string | number} K
 * @template V
 * @param {Map<K, V> | Set<V> | Record<K, V>} object The input object, Map,
 *  or Set value.
 * @return {[K, V][]} An array of property values.
 */
export function entries(object) {
  return isMapOrSet(object) ? array(object.entries())
    : object != null ? /** @type {[K, V][]} */(Object.entries(object))
    : [];
}

/**
 * Returns a new object given iterable *entries* of `[key, value]` pairs.
 * This method is Arquero's version of the *Object.fromEntries* method.
 * @template {string | number} K
 * @template V
 * @param {Iterable<[K, V]>} entries An iterable collection of `[key, value]`
 *  pairs, such as an array of two-element arrays or a *Map*.
 * @return {Record<K, V>} An object of consolidated key-value pairs.
 */
export function object(entries) {
  return entries
    ? /** @type {Record<K, V>} */(Object.fromEntries(entries))
    : NULL;
}

import { isMap } from './is-map.js';
import { isSet } from './is-set.js';

/**
 * @param {*} value
 * @return {value is Map | Set}
 */
export function isMapOrSet(value) {
  return isMap(value) || isSet(value);
}

import has from '../../util/has';

/**
 * Recodes an input value to an alternative value, based on a provided
 * value map. If a fallback value is specified, it will be returned when
 * a matching value is not found in the map; otherwise, the input value
 * is returned unchanged.
 * @param {*} value The value to recode. The value must be safely
 *  coercible to a string for lookup against the value map.
 * @param {object|Map} map An object or Map with input values for keys and
 *  output recoded values as values. If a non-Map object, only the object's
 *  own properties will be considered.
 * @param {*} [fallback] A default fallback value to use if the input
 *  value is not found in the value map.
 * @return {*} The recoded value.
 */
export default function(value, map, fallback) {
  if (map instanceof Map) {
    if (map.has(value)) return map.get(value);
  } else if (has(map, value)) {
    return map[value];
  }
  return fallback !== undefined ? fallback : value;
}
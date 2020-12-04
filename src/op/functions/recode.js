import has from '../../util/has';

/**
 * Recodes an input value to an alternative value, based on a provided
 * value map. If a fallback value is specified, it will be returned when
 * a matching value is not found in the map; otherwise, the input value
 * is returned unchanged.
 * @param {*} value The value to recode. The value must be safely
 *  coercible to a string for lookup against the value map.
 * @param {object} map An object with input values for keys and output
 *  recoded values as values. Only the object's own properties will
 *  be considered.
 * @param {*} [fallback] A default fallback value to use if the input
 *  value is not found in the value map.
 * @return {*} The recoded value.
 */
export default function(value, map, fallback) {
  return has(map, value)
    ? map[value]
    : fallback !== undefined ? fallback : value;
}
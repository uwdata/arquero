/**
 * Recodes an input value to an alternative value, based on a provided
 * value map. If a fallback value is specified, it will be returned when
 * a matching value is not found in the map; otherwise, the input value
 * is returned unchanged.
 * @template T
 * @param {T} value The value to recode. The value must be safely
 *  coercible to a string for lookup against the value map.
 * @param {Map|Record<string,any>} map An object or Map with input values
 *  for keys and output recoded values as values. If a non-Map object, only
 *  the object's own properties will be considered.
 * @param {T} [fallback] A default fallback value to use if the input
 *  value is not found in the value map.
 * @return {T} The recoded value.
 */
export function recode(value, map, fallback) {
  if (map instanceof Map) {
    if (map.has(value)) return map.get(value);
  } else {
    const key = `${value}`;
    if (Object.hasOwn(map, key)) return map[key];
  }
  return fallback !== undefined ? fallback : value;
}

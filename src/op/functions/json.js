/**
 * Parses a string *value* in JSON format, constructing the JavaScript
 * value or object described by the string.
 * @param {string} value The input string value.
 * @return {any} The parsed JSON.
 */
export function parse_json(value) {
  return JSON.parse(value);
}

/**
 * Converts a JavaScript object or value to a JSON string.
 * @param {*} value The value to convert to a JSON string.
 * @return {string} The JSON string.
 */
export function to_json(value) {
  return JSON.stringify(value);
}

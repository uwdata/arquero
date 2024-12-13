/**
 * Parses a string *value* and returns a Date instance. Beware: this method
 * uses JavaScript's *Date.parse()* functionality, which is inconsistently
 * implemented across browsers. That said,
 * [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) formatted strings such
 * as those produced by *op.format_date* and *op.format_utcdate* should be
 * supported across platforms. Note that "bare" ISO date strings such as
 * `"2001-01-01"` are interpreted by JavaScript as indicating midnight of
 * that day in Coordinated Universal Time (UTC), *not* local time. To
 * indicate the local timezone, an ISO string can include additional time
 * components and no `Z` suffix: `"2001-01-01T00:00"`.
 * @param {*} value The input value.
 * @return {Date} The parsed date value.
 */
export function parse_date(value) {
  return value == null ? value : new Date(value);
}

/**
 * Parses a string *value* and returns a floating point number.
 * @param {*} value The input value.
 * @return {number} The parsed number value.
 */
export function parse_float(value) {
  return value == null ? value : Number.parseFloat(value);
}

/**
 * Parses a string *value* and returns an integer of the specified radix
 * (the base in mathematical numeral systems).
 * @param {*} value The input value.
 * @param {number} [radix] An integer between 2 and 36 that represents the
 *  radix (the base in mathematical numeral systems) of the string. Be
 *  careful: this does not default to 10! If *radix* is `undefined`, `0`,
 *  or unspecified, JavaScript assumes the following: If the input string
 *  begins with `"0x"` or `"0X"` (a zero, followed by lowercase or
 *  uppercase X), the radix is assumed to be 16 and the rest of the string
 *  is parsed as a hexidecimal number. If the input string begins with `"0"`
 *  (a zero), the radix is assumed to be 8 (octal) or 10 (decimal). Exactly
 *  which radix is chosen is implementation-dependent.  If the input string
 *  begins with any other value, the radix is 10 (decimal).
 * @return {number} The parsed integer value.
 */
export function parse_int(value, radix) {
  return value == null ? value : Number.parseInt(value, radix);
}

/**
 * Determines whether a string *value* ends with the characters of a
 * specified *search* string, returning `true` or `false` as appropriate.
 * @param {any} value The input string value.
 * @param {string} search The search string to test for.
 * @param {number} [length] If provided, used as the length of *value*
 *  (default `value.length`).
 * @return {boolean} True if the value ends with the search string,
 *  false otherwise.
 */
export function endswith(value, search, length) {
  return value == null ? false : String(value).endsWith(search, length);
}

/**
 * Retrieves the result of matching a string *value* against a regular
 * expression *regexp*. If no *index* is specified, returns an array
 * whose contents depend on the presence or absence of the regular
 * expression global (`g`) flag, or `null` if no matches are found. If the
 * `g` flag is used, all results matching the complete regular expression
 * will be returned, but capturing groups will not. If the `g` flag is not
 * used, only the first complete match and its related capturing groups are
 * returned.
 *
 * If specified, the *index* looks up a value of the resulting match. If
 * *index* is a number, the corresponding index of the result array is
 * returned. If *index* is a string, the value of the corresponding
 * named capture group is returned, or `null` if there is no such group.
 * @param {*} value The input string value.
 * @param {*} regexp The regular expression to match against.
 * @param {number|string} index The index into the match result array
 *  or capture group.
 * @return {string|string[]} The match result.
 */
export function match(value, regexp, index) {
  const m = value == null ? value : String(value).match(regexp);
  return index == null || m == null ? m
    : typeof index === 'number' ? m[index]
    : m.groups ? m.groups[index]
    : null;
}

/**
 * Returns the Unicode normalization form of the string *value*.
 * @param {*} value The input value to normalize.
 * @param {string} form The Unicode normalization form, one of
 *  `'NFC'` (default, canonical decomposition, followed by canonical
 *  composition), `'NFD'` (canonical decomposition), `'NFKC'` (compatibility
 *  decomposition, followed by canonical composition),
 *  or `'NFKD'` (compatibility decomposition).
 * @return {string} The normalized string value.
 */
export function normalize(value, form) {
  return value == null ? value : String(value).normalize(form);
}

/**
 * Pad a string *value* with a given *fill* string (applied from the end of
 * *value* and repeated, if needed) so that the resulting string reaches a
 * given *length*.
 * @param {*} value The input value to pad.
 * @param {number} length The length of the resulting string once the
 *  *value* string has been padded. If the length is lower than
 *  `value.length`, the *value* string will be returned as-is.
 * @param {string} [fill] The string to pad the *value* string with
 *  (default `''`). If *fill* is too long to stay within the target
 *  *length*, it will be truncated: for left-to-right languages the
 *  left-most part and for right-to-left languages the right-most will
 *  be applied.
 * @return {string} The padded string.
 */
export function padend(value, length, fill) {
  return value == null ? value : String(value).padEnd(length, fill);
}

/**
 * Pad a string *value* with a given *fill* string (applied from the start
 * of *value* and repeated, if needed) so that the resulting string reaches
 * a given *length*.
 * @param {*} value The input value to pad.
 * @param {number} length The length of the resulting string once the
 *  *value* string has been padded. If the length is lower than
 *  `value.length`, the *value* string will be returned as-is.
 * @param {string} [fill] The string to pad the *value* string with
 *  (default `''`). If *fill* is too long to stay within the target
 *  *length*, it will be truncated: for left-to-right languages the
 *  left-most part and for right-to-left languages the right-most will
 *  be applied.
 * @return {string} The padded string.
 */
export function padstart(value, length, fill) {
  return value == null ? value : String(value).padStart(length, fill);
}

/**
 * Returns the string *value* converted to upper case.
 * @param {*} value The input string value.
 * @return {string} The upper case string.
 */
export function upper(value) {
  return value == null ? value : String(value).toUpperCase();
}

/**
 * Returns the string *value* converted to lower case.
 * @param {*} value The input string value.
 * @return {string} The lower case string.
 */
export function lower(value) {
  return value == null ? value : String(value).toLowerCase();
}

/**
 * Returns a new string which contains the specified *number* of copies of
 * the *value* string concatenated together.
 * @param {*} value The input string to repeat.
 * @param {*} number An integer between `0` and `+Infinity`, indicating the
 *  number of times to repeat the string.
 * @return {string} The repeated string.
 */
export function repeat(value, number) {
  return value == null ? value : String(value).repeat(number);
}

/**
 * Returns a new string with some or all matches of a *pattern* replaced by
 * a *replacement*. The *pattern* can be a string or a regular expression,
 * and the *replacement* must be a string. If *pattern* is a string, only
 * the first occurrence will be replaced; to make multiple replacements, use
 * a regular expression *pattern* with a `g` (global) flag.
 * @param {*} value The input string value.
 * @param {*} pattern The pattern string or regular expression to replace.
 * @param {*} replacement The replacement string to use.
 * @return {string} The string with patterns replaced.
 */
export function replace(value, pattern, replacement) {
  return value == null
    ? value
    : String(value).replace(pattern, String(replacement));
}

/**
 * Divides a string *value* into an ordered list of substrings based on a
 * *separator* pattern, puts these substrings into an array, and returns the
 * array.
 * @param {*} value The input string value.
 * @param {*} separator A string or regular expression pattern describing
 *  where each split should occur.
 * @param {number} [limit] An integer specifying a limit on the number of
 *  substrings to be included in the array.
 * @return {string[]}
 */
export function split(value, separator, limit) {
  return value == null ? [] : String(value).split(separator, limit);
}

/**
 * Determines whether a string *value* starts with the characters of a
 * specified *search* string, returning `true` or `false` as appropriate.
 * @param {*} value The input string value.
 * @param {string} search The search string to test for.
 * @param {number} [position=0] The position in the *value* string at which
 *  to begin searching (default `0`).
 * @return {boolean} True if the string starts with the search pattern,
 *  false otherwise.
 */
export function startswith(value, search, position) {
  return value == null ? false : String(value).startsWith(search, position);
}

/**
 * Returns the part of the string *value* between the *start* and *end*
 * indexes, or to the end of the string.
 * @param {*} value The input string value.
 * @param {number} [start=0] The index of the first character to include in
 *  the returned substring (default `0`).
 * @param {number} [end] The index of the first character to exclude from
 *  the returned substring (default `value.length`).
 * @return {string} The substring.
 */
export function substring(value, start, end) {
  return value == null ? value : String(value).substring(start, end);
}

/**
 * Returns a new string with whitespace removed from both ends of the input
 * *value* string. Whitespace in this context is all the whitespace
 * characters (space, tab, no-break space, etc.) and all the line terminator
 * characters (LF, CR, etc.).
 * @param {*} value The input string value to trim.
 * @return {string} The trimmed string.
 */
export function trim(value) {
  return value == null ? value : String(value).trim();
}

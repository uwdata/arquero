import assign from '../util/assign';
import error from '../util/error';
import escapeRegExp from '../util/escape-regexp';
import isArray from '../util/is-array';
import isFunction from '../util/is-function';
import isNumber from '../util/is-number';
import isObject from '../util/is-object';
import isString from '../util/is-string';
import toString from '../util/to-string';

export default function resolve(table, sel, map = new Map()) {
  sel = isNumber(sel) ? table.columnName(sel) : sel;

  if (isString(sel)) {
    map.set(sel, sel);
  } else if (isArray(sel)) {
    sel.forEach(r => resolve(table, r, map));
  } else if (isFunction(sel)) {
    resolve(table, sel(table), map);
  } else if (isObject(sel)) {
    assign(map, sel);
  } else {
    error(`Invalid column selection: ${toString(sel)}`);
  }

  return map;
}

function decorate(value, toObject) {
  value.toObject = toObject;
  return value;
}

function toObject(value) {
  return isArray(value) ? value.map(toObject)
    : value && value.toObject ? value.toObject()
    : value;
}

/**
 * Proxy type for SelectHelper function.
 * @typedef {import('../table/transformable').SelectHelper} SelectHelper
 */

/**
 * Select all columns in a table.
 * Returns a function-valued selection compatible with {@link Table#select}.
 * @return {SelectHelper} Selection function compatible with select().
 */
export function all() {
  return decorate(
    table => table.columnNames(),
    () => ({ all: [] })
  );
}

/**
 * Negate a column selection, selecting all other columns in a table.
 * Returns a function-valued selection compatible with {@link Table#select}.
 * @param {...any} selection The selection to negate. May be a column name,
 *  column index, array of either, or a selection function (e.g., from range).
 * @return {SelectHelper} Selection function compatible with select().
 */
export function not(...selection) {
  selection = selection.flat();
  return decorate(
    table => {
      const drop = resolve(table, selection);
      return table.columnNames(name => !drop.has(name));
    },
    () => ({ not: toObject(selection) })
  );
}

/**
 * Select a contiguous range of columns.
 * @param {string|number} start The name/index of the first selected column.
 * @param {string|number} end The name/index of the last selected column.
 * @return {SelectHelper} Selection function compatible with select().
 */
export function range(start, end) {
  return decorate(
    table => {
      let i = isNumber(start) ? start : table.columnIndex(start);
      let j = isNumber(end) ? end : table.columnIndex(end);
      if (j < i) { const t = j; j = i; i = t; }
      return table.columnNames().slice(i, j + 1);
    },
    () => ({ range: [start, end] })
  );
}

/**
 * Select all columns whose names match a pattern.
 * @param {string|RegExp} pattern A string or regular expression pattern to match.
 * @return {SelectHelper} Selection function compatible with select().
 */
export function matches(pattern) {
  if (isString(pattern)) pattern = RegExp(escapeRegExp(pattern));
  return decorate(
    table => table.columnNames(name => pattern.test(name)),
    () => ({ matches: [pattern.source, pattern.flags] })
  );
}

/**
 * Select all columns whose names start with a string.
 * @param {string} string The string to match at the start of the column name.
 * @return {SelectHelper} Selection function compatible with select().
 */
export function startswith(string) {
  return matches(RegExp('^' + escapeRegExp(string)));
}

/**
 * Select all columns whose names end with a string.
 * @param {string} string The string to match at the end of the column name.
 * @return {SelectHelper} Selection function compatible with select().
 */
export function endswith(string) {
  return matches(RegExp(escapeRegExp(string) + '$'));
}
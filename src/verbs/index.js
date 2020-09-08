import __dedupe from './dedupe';
import __derive from './derive';
import __except from './except';
import __filter from './filter';
import __fold from './fold';
import __intersect from './intersect';
import __join from './join';
import __join_filter from './join-filter';
import __lookup from './lookup';
import __pivot from './pivot';
import __rollup from './rollup';
import __sample from './sample';
import __select from './select';
import __spread from './spread';
import __union from './union';
import __unroll from './unroll';
import __groupby from './groupby';
import __orderby from './orderby';

import __concat from '../engine/concat';
import __reduce from '../engine/reduce';
import __ungroup from '../engine/ungroup';
import __unorder from '../engine/unorder';

import ColumnTable from '../table/column-table';
import mapObject from '../util/map-object';

Object.assign(ColumnTable.prototype, {
  __concat,
  __dedupe,
  __derive,
  __except,
  __filter,
  __fold,
  __intersect,
  __join,
  __join_filter,
  __lookup,
  __pivot,
  __rollup,
  __sample,
  __select,
  __spread,
  __union,
  __unroll,
  __groupby,
  __orderby,
  __ungroup,
  __unorder,
  __reduce
});

export { default as op } from '../op/op-api';
export { default as bin } from './expr/bin';
export { default as desc } from './expr/desc';
export { default as rolling } from './expr/rolling';
export { all, not, range } from './expr/selection';

/**
 * Create a new table for a set of named columns.
 * @param {Object.<string, Array|TypedArray>} columns
 *  The set of named column arrays.
 *  Object keys are the column names.
 *  The enumeration order of the keys determines the column indices.
 *  Object values must be arrays (or array-like values) of identical length.
 * @return {ColumnTable} the instantiated table
 * @example table({ colA: ['a', 'b', 'c'], colB: [3, 4, 5] })
 */
export function table(columns) {
  return new ColumnTable(mapObject(columns, x => x));
}

/**
 * Create a new table from an existing object, such as an array of
 * objects or a set of key-value pairs.
 * @param {Object|Array|Map} values Data values to populate the table.
 *  If array-valued or iterable, imports rows for each non-null value,
 *  using the provided column names as keys for each row object. If no
 *  names are provided, the first non-null object's own keys are used.
 *  If object- or Map-valued, create columns for the keys and values.
 * @param {string[]} [names] Column names to include.
 *  For object or Map values, specifies the key and value column names.
 *  Otherwise, specifies the keys to look up on each row object.
 * @return {ColumnTable} the instantiated table.
 * @example from([ { colA: 1, colB: 2 }, { colA: 3, colB: 4 } ])
 */
export function from(values, names) {
  return ColumnTable.from(values, names);
}
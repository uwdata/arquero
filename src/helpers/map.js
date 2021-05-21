import wrap from './wrap';
import error from '../util/error';

/**
 * Specify a map function that applies a function directly (with
 * no parsing or code generation) to one or more column values.
 * This helper can be used in lieu of single-table table expressions
 * (which are internally parsed and rewritten) to apply a JavaScript
 * function as-is, including support for closures.
 * @param {import('../table/transformable').Select} columns An ordered
 *  selection of columns to use as input to the map function.
 * @param {Function} mapfn A function to apply to column values for each row.
 * @return {object} A wrapper object representing the mapping.
 * @example map('colA', a => a.toFixed(2))
 * @example map(['colA', 'colB'], (a, b) => a * -b)
 */
export default function(columns, mapfn) {
  return wrap(mapfn, {
    map: true,
    columns,
    toString() { error('Map functions can not be serialized.'); }
  });
}
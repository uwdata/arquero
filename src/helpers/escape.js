import wrap from './wrap';
import error from '../util/error';

/**
 * Escape a function to prevent it from being parsed and recompiled.
 * This helper can be used in lieu of single-table table expressions
 * (which are internally parsed and rewritten) to apply a JavaScript
 * function as-is, including support for closures.
 * @param {Function} func A function to apply to row objects.
 * @return {object} A wrapper object representing the escaped function.
 * @example escape(d => d.a.toFixed(2))
 * @example escape(d => d.a * -d.b)
 */
export default function(func) {
  return wrap(func, {
    escape: true,
    toString() { error('Escaped functions can not be serialized.'); }
  });
}
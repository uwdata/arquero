import aggregateFunctions from './aggregate-functions';
import windowFunctions from './window-functions';
import functions from './functions';
import has from '../util/has';

export {
  functions,
  aggregateFunctions,
  windowFunctions
};

/**
 * Check if an aggregate function with the given name exists.
 * @param {string} name The name of the aggregate function.
 * @return {boolean} True if found, false otherwise.
 */
export function isAggregate(name) {
  return has(aggregateFunctions, name);
}

/**
 * Check if a window function with the given name exists.
 * @param {string} name The name of the window function.
 * @return {boolean} True if found, false otherwise.
 */
export function isWindow(name) {
  return has(windowFunctions, name);
}

/**
 * Get an aggregate function definition.
 * @param {string} name The name of the aggregate function.
 * @return {AggregateDef} The aggregate function definition,
 *  or undefined if not found.
 */
export function getAggregate(name) {
  return isAggregate(name) && aggregateFunctions[name];
}

/**
 * Get a window function definition.
 * @param {string} name The name of the window function.
 * @return {WindowDef} The window function definition,
 *  or undefined if not found.
 */
export function getWindow(name) {
  return isWindow(name) && windowFunctions[name];
}

/**
 * Get an expression function definition.
 * @param {string} name The name of the function.
 * @return {Function} The function instance, or undefined if not found.
 */
export function getFunction(name) {
  return has(functions, name) && functions[name];
}
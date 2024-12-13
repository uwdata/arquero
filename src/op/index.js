import { aggregateFunctions } from './aggregate-functions.js';
import { windowFunctions } from './window-functions.js';
import { functions } from './functions/index.js';

export { aggregateFunctions } from './aggregate-functions.js';
export { windowFunctions } from './window-functions.js';
export { functions } from './functions/index.js';

/**
 * Check if an aggregate function with the given name exists.
 * @param {string} name The name of the aggregate function.
 * @return {boolean} True if found, false otherwise.
 */
export function hasAggregate(name) {
  return Object.hasOwn(aggregateFunctions, name);
}

/**
 * Check if a window function with the given name exists.
 * @param {string} name The name of the window function.
 * @return {boolean} True if found, false otherwise.
 */
export function hasWindow(name) {
  return Object.hasOwn(windowFunctions, name);
}

/**
 * Check if an expression function with the given name exists.
 * @param {string} name The name of the function.
 * @return {boolean} True if found, false otherwise.
 */
 export function hasFunction(name) {
  return Object.hasOwn(functions, name) || name === 'row_object';
}

/**
 * Get an aggregate function definition.
 * @param {string} name The name of the aggregate function.
 * @return {import('./aggregate-functions.js').AggregateDef}
 *  The aggregate function definition, or undefined if not found.
 */
export function getAggregate(name) {
  return hasAggregate(name) && aggregateFunctions[name];
}

/**
 * Get a window function definition.
 * @param {string} name The name of the window function.
 * @return {import('./window-functions.js').WindowDef}
 *  The window function definition, or undefined if not found.
 */
export function getWindow(name) {
  return hasWindow(name) && windowFunctions[name];
}

/**
 * Get an expression function definition.
 * @param {string} name The name of the function.
 * @return {Function} The function instance, or undefined if not found.
 */
export function getFunction(name) {
  return hasFunction(name) && functions[name];
}

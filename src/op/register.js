import { aggregateFunctions } from './aggregate-functions.js';
import { windowFunctions } from './window-functions.js';
import { functions } from './functions/index.js';
import { op, opApi } from './op-api.js';
import { ROW_OBJECT } from '../expression/row-object.js';
import { error } from '../util/error.js';
import { toString } from '../util/to-string.js';

const onIllegal = (name, type) =>
  error(`Illegal ${type} name: ${toString(name)}`);

const onDefined = (name, type) =>
  error(`The ${type} ${toString(name)} is already defined. Use override option?`);

const onReserve = (name, type) =>
  error(`The ${type} name ${toString(name)} is reserved and can not be overridden.`);

function check(name, options, obj = opApi, type = 'function') {
  if (!name) onIllegal(name, type);
  if (!options.override && Object.hasOwn(obj, name)) onDefined(name, type);
}

function verifyFunction(name, def, object, options) {
  return object[name] === def || check(name, options);
}

/**
 * Register an aggregate or window operation.
 * @param {string} name The name of the operation
 * @param {AggregateDef|WindowDef} def The operation definition.
 * @param {object} object The registry object to add the definition to.
 * @param {RegisterOptions} [options] Registration options.
 */
function addOp(name, def, object, options = {}) {
  if (verifyFunction(name, def, object, options)) return;
  const [nf = 0, np = 0] = def.param; // num fields, num params
  object[name] = def;
  opApi[name] = (...params) => op(
    name,
    params.slice(0, nf),
    params.slice(nf, nf + np)
  );
}

/**
 * Register a custom aggregate function.
 * @param {string} name The name to use for the aggregate function.
 * @param {AggregateDef} def The aggregate operator definition.
 * @param {RegisterOptions} [options] Function registration options.
 * @throws If a function with the same name is already registered and
 *  the override option is not specified.
 */
export function addAggregateFunction(name, def, options) {
  addOp(name, def, aggregateFunctions, options);
}

/**
 * Register a custom window function.
 * @param {string} name The name to use for the window function.
 * @param {WindowDef} def The window operator definition.
 * @param {RegisterOptions} [options] Function registration options.
 * @throws If a function with the same name is already registered and
 *  the override option is not specified.
 */
export function addWindowFunction(name, def, options) {
  addOp(name, def, windowFunctions, options);
}

/**
 * Register a function for use within table expressions.
 * If only a single argument is provided, it will be assumed to be a
 * function and the system will try to extract its name.
 * @param {string} name The name to use for the function.
 * @param {Function} fn A standard JavaScript function.
 * @param {RegisterOptions} [options] Function registration options.
 * @throws If a function with the same name is already registered and
 *  the override option is not specified, or if no name is provided
 *  and the input function is anonymous.
 */
export function addFunction(name, fn, options = {}) {
  if (arguments.length === 1) {
    // @ts-ignore
    fn = name;
    name = fn.name;
    if (name === '' || name === 'anonymous') {
      error('Anonymous function provided, please include a name argument.');
    } else if (name === ROW_OBJECT) {
      onReserve(ROW_OBJECT, 'function');
    }
  }
  if (verifyFunction(name, fn, functions, options)) return;
  functions[name] = fn;
  opApi[name] = fn;
}

/**
 * Aggregate function definition.
 * @typedef {import('./aggregate-functions.js').AggregateDef} AggregateDef
 */

/**
 * Window function definition.
 * @typedef {import('./window-functions.js').WindowDef} WindowDef
 */

/**
 * Options for registering new functions.
 * @typedef {object} RegisterOptions
 * @property {boolean} [override=false] Flag indicating if the added
 *  function can override an existing function with the same name.
 */

import aggregateFunctions from './aggregate-functions';
import windowFunctions from './window-functions';
import functions from './functions';
import op from './op';
import ops from './op-api';
import error from '../util/error';
import has from '../util/has';

function check(name) {
  if (has(ops, name)) {
    error(`Function ${JSON.stringify(name)} is already defined.`);
  }
}

function addOp(name, def, object, options = {}) {
  const { numFields, numParams, override } = options;
  if (object[name] === def) return;
  if (!override) check(name);
  if (numFields != null || numParams != null) {
    def.param = [numFields || 0, numParams || 0];
  }
  object[name] = def;
  const [nf, np] = def.param;
  ops[name] = (...params) => {
    return op(name, params.slice(0, nf), params.slice(nf, nf + np));
  };
}

/**
 * Options for registering new functions formatting.
 * @typedef {object} AddFunctionOptions
 * @property {boolean} [override=false] Flag indicating if the added
 *  function can override an existing function with the same name.
 * @param {number} [numFields=0] The number of field inputs to the operator.
 * @param {number} [numParams=0] The number of additional operator parameters.
 */

/**
 * Register a custom aggregate function.
 * @param {string} name The name to use for the aggregate function.
 * @param {AggregateDef} def The aggregate operator definition.
 * @param {AddFunctionOptions} [options] Function registration options.
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
 * @param {AddFunctionOptions} [options] Function registration options.
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
 * @param {string} [name] The name to use for the function.
 * @param {Function} fn A standard JavaScript function.
 * @param {AddFunctionOptions} [options] Function registration options.
 * @throws If a function with the same name is already registered and
 *  the override option is not specified, or if no name is provided
 *  and the input function is anonymous.
 */
export function addFunction(name, fn, options = {}) {
  if (arguments.length === 1) {
    fn = name;
    name = fn.name;
    if (name === '' || name === 'anonymous') {
      error('Anonymous function provided, please include a name argument.');
    }
  }
  if (functions[name] !== fn) {
    if (!options.override) check(name);
    functions[name] = fn;
    ops[name] = fn;
  }
}
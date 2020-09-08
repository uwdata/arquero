import aggregateFunctions from './aggregate-functions';
import windowFunctions from './window-functions';
import functions from './functions';
import op from './op';
import ops from './op-api';
import error from '../util/error';
import has from '../util/has';

function check(name) {
  if (has(ops, name)) {
    error(`Function "${name}" is already defined.`);
  }
}

function addOp(name, def, object, numFields, numParams) {
  check(name);
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
 * Register a custom aggregate function.
 * @param {string} name The name to use for the aggregate function.
 * @param {AggregateDef} def The aggregate operator definition.
 * @param {number} [numFields=0] The number of field inputs to the operator.
 * @param {number} [numParams=0] The number of additional operator parameters.
 * @throws If a function with the same name is already registered.
 */
export function addAggregateFunction(name, def, numFields, numParams) {
  addOp(name, def, aggregateFunctions, numFields, numParams);
}

/**
 * Register a custom window function.
 * @param {string} name The name to use for the window function.
 * @param {WindowDef} def The window operator definition.
 * @param {number} [numFields=0] The number of field inputs to the operator.
 * @param {number} [numParams=0] The number of additional operator parameters.
 * @throws If a function with the same name is already registered.
 */
export function addWindowFunction(name, def, numFields, numParams) {
  addOp(name, def, windowFunctions, numFields, numParams);
}

/**
 * Register a function for use within table expressions.
 * If only a single argument is provided, it will be assumed to be a
 * function and the system will try to extract its name.
 * @param {string} [name] The name to use for the function.
 * @param {Function} fn A standard JavaScript function.
 * @throws If a function with the same name is already registered, or
 *  if no name is provided and the input function is anonymous.
 */
export function addFunction(name, fn) {
  if (arguments.length === 1) {
    fn = name;
    name = fn.name;
    if (name === '' || name === 'anonymous') {
      error('Anonymous function provided, please include a name argument.');
    }
  }
  check(name);
  functions[name] = fn;
  ops[name] = fn;
}
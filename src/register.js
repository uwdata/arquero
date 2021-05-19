import ColumnTable from './table/column-table';
import aggregateFunctions from './op/aggregate-functions';
import windowFunctions from './op/window-functions';
import functions from './op/functions';
import op from './op/op';
import ops from './op/op-api';
import Query, { addQueryVerb } from './query/query';
import { Verbs, createVerb } from './query/verb';
import { ROW_OBJECT } from './expression/row-object';
import error from './util/error';
import has from './util/has';
import toString from './util/to-string';

const onIllegal = (name, type) =>
  error(`Illegal ${type} name: ${toString(name)}`);

const onDefined = (name, type) =>
  error(`The ${type} ${toString(name)} is already defined. Use override option?`);

const onReserve = (name, type) =>
  error(`The ${type} name ${toString(name)} is reserved and can not be overridden.`);

function check(name, options, obj = ops, type = 'function') {
  if (!name) onIllegal(name, type);
  if (!options.override && has(obj, name)) onDefined(name, type);
}

// -- Op Functions --------------------------------------------------

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
  const [nf = 0, np = 0] = def.param;
  object[name] = def;
  ops[name] = (...params) => op(
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
  ops[name] = fn;
}

// -- Table Methods and Verbs ---------------------------------------

const proto = ColumnTable.prototype;

/**
 * Reserved table/query methods that must not be overwritten.
 */
let RESERVED;

function addReserved(obj) {
  for (; obj; obj = Object.getPrototypeOf(obj)) {
    Object.getOwnPropertyNames(obj).forEach(name => RESERVED[name] = 1);
  }
}

function verifyTableMethod(name, fn, options) {
  const type = 'method';

  // exit early if duplicate re-assignment
  if (proto[name] && proto[name].fn === fn) return true;

  // initialize reserved properties to avoid overriding internals
  if (!RESERVED) {
    RESERVED = {};
    addReserved(proto);
    addReserved(Query.prototype);
  }

  // perform name checks
  if (RESERVED[name]) onReserve(name, type);
  if ((name + '')[0] === '_') onIllegal(name, type);
  check(name, options, proto, type);
}

/**
 * Register a new table method. A new method will be added to the column
 * table prototype. When invoked from a table, the registered method will
 * be invoked with the table as the first argument, followed by all the
 * provided arguments.
 * @param {string} name The name of the table method.
 * @param {Function} method The table method.
 * @param {RegisterOptions} options
 */
export function addTableMethod(name, method, options = {}) {
  if (verifyTableMethod(name, method, options)) return;
  proto[name] = function(...args) { return method(this, ...args); };
  proto[name].fn = method;
}

/**
 * Register a new transformation verb.
 * @param {string} name The name of the verb.
 * @param {Function} method The verb implementation.
 * @param {ParamDef[]} params The verb parameter schema.
 * @param {RegisterOptions} options Function registration options.
 */
export function addVerb(name, method, params, options = {}) {
  // register table method first
  // if that doesn't throw, add serializable verb entry
  addTableMethod(name, method, options);
  addQueryVerb(name, Verbs[name] = createVerb(name, params));
}

// -- Package Bundles -----------------------------------------------

const PACKAGE = 'arquero_package';

/**
 * Add an extension package of functions, table methods, and/or verbs.
 * @param {Package|PackageBundle} bundle The package of extensions.
 * @throws If package validation fails.
 */
export function addPackage(bundle, options = {}) {
  const pkg = bundle && bundle[PACKAGE] || bundle;
  const parts = {
    functions: [
      (name, def, opt) => verifyFunction(name, def, functions, opt),
      addFunction
    ],
    aggregateFunctions: [
      (name, def, opt) => verifyFunction(name, def, aggregateFunctions, opt),
      addAggregateFunction
    ],
    windowFunctions: [
      (name, def, opt) => verifyFunction(name, def, windowFunctions, opt),
      addWindowFunction
    ],
    tableMethods: [
      verifyTableMethod,
      addTableMethod
    ],
    verbs: [
      (name, obj, opt) => verifyTableMethod(name, obj.method, opt),
      (name, obj, opt) => addVerb(name, obj.method, obj.params, opt)
    ]
  };

  function scan(index) {
    for (const key in parts) {
      const part = parts[key];
      const p = pkg[key];
      for (const name in p) part[index](name, p[name], options);
    }
  }
  scan(0); // first validate package, throw if validation fails
  scan(1); // then add package content
}

/**
 * Aggregate function definition.
 * @typedef {import('./op/aggregate-functions').AggregateDef} AggregateDef
 */

/**
 * Window function definition.
 * @typedef {import('./op/window-functions').WindowDef} WindowDef
 */

/**
 * Verb parameter definition.
 * @typedef {import('./query/verb').ParamDef} ParamDef
 */

/**
 * Verb definition.
 * @typedef {object} VerbDef
 * @property {Function} method A function implementing the verb.
 * @property {ParamDef[]} params The verb parameter schema.
 */

/**
 * Verb parameter definition.
 * @typedef {object} ParamDef
 * @property {string} name The verb parameter name.
 * @property {ParamType} type The verb parameter type.
 */

/**
 * A package of op function and table method definitions.
 * @typedef {object} Package
 * @property {{[name: string]: Function}} [functions] Standard function entries.
 * @property {{[name: string]: AggregateDef}} [aggregateFunctions] Aggregate function entries.
 * @property {{[name: string]: WindowDef}} [windowFunctions] Window function entries.
 * @property {{[name: string]: Function}} [tableMethods] Table method entries.
 * @property {{[name: string]: VerbDef}} [verbs] Verb entries.
 */

/**
 * An object containing an extension package.
 * @typedef {object} PackageBundle
 * @property {Package} arquero.package The package bundle.
 */

/**
 * Options for registering new functions.
 * @typedef {object} RegisterOptions
 * @property {boolean} [override=false] Flag indicating if the added
 *  function can override an existing function with the same name.
 */
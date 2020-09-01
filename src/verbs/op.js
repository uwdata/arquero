import { aggregateFunctions, functions, windowFunctions } from '../op';
import error from '../util/error';
import has from '../util/has';
import toArray from '../util/to-array';

class Op {
  constructor(name, fields, params) {
    this.name = name;
    this.fields = fields;
    this.params = params;
  }
  toString() {
    const a = [
      ...this.fields.map(f => `d[${JSON.stringify(f)}]`),
      ...this.params.map(p => JSON.stringify(p))
    ];
    return `d => op.${this.name}(${a})`;
  }
}

function op(name, fields = [], params = []) {
  return new Op(name, toArray(fields), toArray(params));
}

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
  let [nf, np] = def.param;
  ops[name] = (...params) => {
    return op(name, params.slice(0, nf), params.slice(nf, nf + np));
  };
}

/**
 * Register a function for use within table expressions.
 * If only a single argument is provided, it will be assumed to be a
 * function and the system will try to extract its name.
 * @param {string} [name] The name to use for the function.
 * @param {Function} fn A standard JavaScript function.
 * @throws If no name is provided and the input function is anonymous,
 *  or if a function with the same name is already registered.
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

/**
 * Register a custom aggregate function.
 * @param {string} name The name to use for the aggregate function.
 * @param {AggregateDef} def The aggregate operator definition.
 * @param {number} [numFields=0] The number of field inputs to the operator.
 * @param {number} [numParams=0] The number of additional operator parameters.
 */
export function addAggregateFunction(name, def, numFields, numParams) {
  addOp(name, def, aggregateFunctions, numFields, numParams);
}

/**
 * Register a custom aggregate function.
 * @param {string} name The name to use for the window function.
 * @param {WindowDef} def The window operator definition.
 * @param {number} [numFields=0] The number of field inputs to the operator.
 * @param {number} [numParams=0] The number of additional operator parameters.
 */
export function addWindowFunction(name, def, numFields, numParams) {
  addOp(name, def, windowFunctions, numFields, numParams);
}

const ops = {
  ...functions,

  /**
   * Aggregate function to count the number of records (rows).
   * @returns {number} The count of records.
   */
  count: () => op('count'),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {*} An arbitrary observed value.
   */
  any: (field) => op('any', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The list of values.
   */
  values: (field) => op('values', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The count of valid values.
   */
  valid: (field) => op('valid', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The count of invalid values.
   */
  invalid: (field) => op('invalid', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The count of distinct values.
   */
  distinct: (field) => op('distinct', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {Array} The array of unique values.
   */
  unique: (field) => op('unique', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The mode value.
   */
  mode: (field) => op('mode', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The sum of the values.
   */
  sum: (field) => op('sum', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The product of the values.
   */
  product: (field) => op('product', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The mean (average) of the values.
   */
  mean: (field) => op('mean', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The average (mean) of the values.
   */
  average: (field) => op('average', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The sample variance of the values.
   */
  variance: (field) => op('variance', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The population variance of the values.
   */
  variancep: (field) => op('variancep', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The sample standard deviation of the values.
   */
  stdev: (field) => op('stdev', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The population standard deviation of the values.
   */
  stdevp: (field) => op('stdevp', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The minimum value.
   */
  min: (field) => op('min', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The maximum value.
   */
  max: (field) => op('max', field),

  /**
   * Aggregate function to compute the quantile boundary
   * of a data field for a probability threshold.
   * @param {*} field The data field.
   * @param {number} p The probability threshold.
   * @return {number} The quantile value.
   */
  quantile: (field, p) => op('quantile', field, p),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The median value.
   */
  median: (field) => op('median', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The sample covariance of the values.
   */
  covariance: (field) => op('covariance', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The population covariance of the values.
   */
  covariancep: (field) => op('covariancep', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @return {number} The correlation between the field values.
   */
  corr: (field) => op('corr', field),

  /**
   * Aggregate function
   * @param {*} field The data field.
   * @param {number} [maxbins=20] The maximum number of allowed bins.
   * @param {boolean} [nice=true] Flag indicating if the bin min and max
   *  should snap to "nice" human-friendly values.
   * @param {number} [minstep] The minimum allowed step size between bins.
   * @return {[number, number, number]} The bin min, max, and step values.
   */
  bins: (field, maxbins, nice, minstep) =>
    op('bins', field, [maxbins, nice, minstep]),

  /**
   * Window function to assign consecutive row numbers, starting from 1.
   * @return {number} The row number value.
   */
  row_number: () => op('row_number'),

  /**
   * Window function to assign a rank to each value in a group, starting
   * from 1. Peer values are assigned the same rank. Subsequent ranks
   * reflect the number of prior values: if the first two values tie for
   * rank 1, the third value is assigned rank 3.
   * @return {number} The rank value.
   */
  rank: () => op('rank'),

  /**
   * Window function to assign a fractional (average) rank to each value in
   * a group, starting from 1. Peer values are assigned the average of their
   * indices: if the first two values tie, both will be assigned rank 1.5.
   * @return {number} The peer-averaged rank value.
   */
  avg_rank: () => op('avg_rank'),

  /**
   * Window function to assign a dense rank to each value in a group,
   * starting from 1. Peer values are assigned the same rank. Subsequent
   * ranks do not reflect the number of prior values: if the first two
   * values tie for rank 1, the third value is assigned rank 2.
   * @return {number} The dense rank value.
   */
  dense_rank: () => op('dense_rank'),

  /**
   * Window function to assign a percentage rank to each value in a group.
   * The percent is calculated as (rank - 1) / (group_size - 1).
   * @return {number} The percentage rank value.
   */
  percent_rank: () => op('percent_rank'),

  /**
   * Window function to assign a cumulative distribution value between 0 and 1
   * to each value in a group.
   * @return {number} The cumulative distribution value.
   */
  cume_dist: () => op('cume_dist'),

  /**
   * Window function to assign a quantile (e.g., percentile) value to each
   * value in a group. Accepts an integer parameter indicating the number of
   * buckets to use (e.g., 100 for percentiles, 5 for quintiles).
   * @param {number} num The number of buckets for ntile calculation.
   * @return {number} The quantile value.
   */
  ntile: (num) => op('ntile', null, num),

  /**
   * Window function to assign a value that precedes the current value by
   * a specified number of positions. If no such value exists, returns a
   * default value instead.
   * @param {*} field The data field.
   * @param {number} [offset=1] The lag offset from the current value.
   * @param {*} [defaultValue=undefined] The default value.
   * @return {*} The lagging value.
   */
  lag: (field, offset, defaultValue) => op('lag', field, [offset, defaultValue]),

  /**
   * Window function to assign a value that follows the current value by
   * a specified number of positions. If no such value exists, returns a
   * default value instead.
   * @param {*} field The data field.
   * @param {number} [offset=1] The lead offset from the current value.
   * @param {*} [defaultValue=undefined] The default value.
   * @return {*} The leading value.
   */
  lead: (field, offset, defaultValue) => op('lead', field, [offset, defaultValue]),

  /**
   * Window function to assign the first value in a sliding window frame.
   * @param {*} field The data field.
   * @return {*} The first value in the current frame.
   */
  first_value: (field) => op('first_value', field),

  /**
   * Window function to assign the last value in a sliding window frame.
   * @param {*} field The data field.
   * @return {*} The last value in the current frame.
   */
  last_value: (field) => op('last_value', field),

  /**
   * Window function to assign the nth value in a sliding window frame
   * (counting from 1), or undefined if no such value exists.
   * @param {*} field The data field.
   * @param {number} nth The nth position, starting from 1.
   * @return {*} The nth value in the current frame.
   */
  nth_value: (field, nth) => op('nth_value', field, nth)
};

export default ops;
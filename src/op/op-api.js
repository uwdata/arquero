import { functions } from './functions/index.js';
import { toArray } from '../util/to-array.js';
import { toString } from '../util/to-string.js';

export class Op {
  constructor(name, fields, params) {
    this.name = name;
    this.fields = fields;
    this.params = params;
  }
  toString() {
    const args = [
      ...this.fields.map(f => `d[${toString(f)}]`),
      ...this.params.map(toString)
    ];
    return `d => op.${this.name}(${args})`;
  }
  toObject() {
    return { expr: this.toString(), func: true };
  }
}

/**
 * @param {string} name
 * @param {any | any[]} [fields]
 * @param {any | any[]} [params]
 */
export function op(name, fields = [], params = []) {
  return new Op(name, toArray(fields), toArray(params));
}

export const any = (field) => op('any', field);
export const count = () => op('count');
export const array_agg = (field) => op('array_agg', field);
export const array_agg_distinct = (field) => op('array_agg_distinct', field);
export const map_agg = (key, value) => op('map_agg', [key, value]);
export const object_agg = (key, value) => op('object_agg', [key, value]);
export const entries_agg = (key, value) => op('entries_agg', [key, value]);

/**
 * @typedef {import('../table/types.js').Struct} Struct
 */

/**
 * All table expression operations including normal functions,
 * aggregate functions, and window functions.
 */
export const opApi = {
  ...functions,

  /**
   * Generate an object representing the current table row.
   * @param {...string} names The column names to include in the object.
   *  If unspecified, all columns are included.
   * @return {Struct} The generated row object.
   */
  row_object: (...names) => op('row_object', null, names.flat()),

  /**
   * Aggregate function to count the number of records (rows).
   * @returns {number} The count of records.
   */
  count,

  /**
   * Aggregate function returning an arbitrary observed value.
   * @template T
   * @param {T} field The data field.
   * @return {T} An arbitrary observed value.
   */
  any,

  /**
   * Aggregate function to collect an array of values.
   * @template T
   * @param {T} field The data field.
   * @return {Array<T>} A list of values.
   */
  array_agg,

  /**
   * Aggregate function to collect an array of distinct (unique) values.
   * @template T
   * @param {T} field The data field.
   * @return {Array<T>} An array of unique values.
   */
  array_agg_distinct,

  /**
   * Aggregate function to create an object given input key and value fields.
   * @template K, V
   * @param {K} key The object key field.
   * @param {V} value The object value field.
   * @return {Record<K, V>} An object of key-value pairs.
   */
  object_agg,

  /**
   * Aggregate function to create a Map given input key and value fields.
   * @template K, V
   * @param {K} key The object key field.
   * @param {V} value The object value field.
   * @return {Map<K, V>} A Map of key-value pairs.
   */
  map_agg,

  /**
   * Aggregate function to create an array in the style of Object.entries()
   * given input key and value fields.
   * @template K, V
   * @param {K} key The object key field.
   * @param {V} value The object value field.
   * @return {[K, V][]} An array of [key, value] arrays.
   */
  entries_agg,

  /**
   * Aggregate function to count the number of valid values.
   * Invalid values are null, undefined, or NaN.
   * @param {*} field The data field.
   * @return {number} The count of valid values.
   */
  // @ts-ignore
  valid: (field) => op('valid', field),

  /**
   * Aggregate function to count the number of invalid values.
   * Invalid values are null, undefined, or NaN.
   * @param {*} field The data field.
   * @return {number} The count of invalid values.
   */
  // @ts-ignore
  invalid: (field) => op('invalid', field),

  /**
   * Aggregate function to count the number of distinct values.
   * @param {*} field The data field.
   * @return {number} The count of distinct values.
   */
  // @ts-ignore
  distinct: (field) => op('distinct', field),

  /**
   * Aggregate function to determine the mode (most frequent) value.
   * @template T
   * @param {T} field The data field.
   * @return {T} The mode value.
   */
  // @ts-ignore
  mode: (field) => op('mode', field),

  /**
   * Aggregate function to sum values.
   * @param {*} field The data field.
   * @return {number} The sum of the values.
   */
  // @ts-ignore
  sum: (field) => op('sum', field),

  /**
   * Aggregate function to multiply values.
   * @param {*} field The data field.
   * @return {number} The product of the values.
   */
  // @ts-ignore
  product: (field) => op('product', field),

  /**
   * Aggregate function for the mean (average) value.
   * @param {*} field The data field.
   * @return {number} The mean (average) of the values.
   */
  // @ts-ignore
  mean: (field) => op('mean', field),

  /**
   * Aggregate function for the average (mean) value.
   * @param {*} field The data field.
   * @return {number} The average (mean) of the values.
   */
  // @ts-ignore
  average: (field) => op('average', field),

  /**
   * Aggregate function for the sample variance.
   * @param {*} field The data field.
   * @return {number} The sample variance of the values.
   */
  // @ts-ignore
  variance: (field) => op('variance', field),

  /**
   * Aggregate function for the population variance.
   * @param {*} field The data field.
   * @return {number} The population variance of the values.
   */
  // @ts-ignore
  variancep: (field) => op('variancep', field),

  /**
   * Aggregate function for the sample standard deviation.
   * @param {*} field The data field.
   * @return {number} The sample standard deviation of the values.
   */
  // @ts-ignore
  stdev: (field) => op('stdev', field),

  /**
   * Aggregate function for the population standard deviation.
   * @param {*} field The data field.
   * @return {number} The population standard deviation of the values.
   */
  // @ts-ignore
  stdevp: (field) => op('stdevp', field),

  /**
   * Aggregate function for the minimum value.
   * @template T
   * @param {T} field The data field.
   * @return {T} The minimum value.
   */
  // @ts-ignore
  min: (field) => op('min', field),

  /**
   * Aggregate function for the maximum value.
   * @template T
   * @param {T} field The data field.
   * @return {T} The maximum value.
   */
  // @ts-ignore
  max: (field) => op('max', field),

  /**
   * Aggregate function to compute the quantile boundary
   * of a data field for a probability threshold.
   * @param {*} field The data field.
   * @param {number} p The probability threshold.
   * @return {number} The quantile value.
   */
  // @ts-ignore
  quantile: (field, p) => op('quantile', field, p),

  /**
   * Aggregate function for the median value.
   * This is a shorthand for the 0.5 quantile value.
   * @param {*} field The data field.
   * @return {number} The median value.
   */
  // @ts-ignore
  median: (field) => op('median', field),

  /**
   * Aggregate function for the sample covariance between two variables.
   * @param {*} field1 The first data field.
   * @param {*} field2 The second data field.
   * @return {number} The sample covariance of the values.
   */
  // @ts-ignore
  covariance: (field1, field2) => op('covariance', [field1, field2]),

  /**
   * Aggregate function for the population covariance between two variables.
   * @param {*} field1 The first data field.
   * @param {*} field2 The second data field.
   * @return {number} The population covariance of the values.
   */
  // @ts-ignore
  covariancep: (field1, field2) => op('covariancep', [field1, field2]),

  /**
   * Aggregate function for the product-moment correlation between two variables.
   * To instead compute a rank correlation, compute the average ranks for each
   * variable and then apply this function to the result.
   * @param {*} field1 The first data field.
   * @param {*} field2 The second data field.
   * @return {number} The correlation between the field values.
   */
  // @ts-ignore
  corr: (field1, field2) => op('corr', [field1, field2]),

  /**
   * Aggregate function for calculating a binning scheme in terms of
   * the minimum bin boundary, maximum bin boundary, and step size.
   * @param {*} field The data field.
   * @param {number} [maxbins=15] The maximum number of allowed bins.
   * @param {boolean} [nice=true] Flag indicating if the bin min and max
   *  should snap to "nice" human-friendly values.
   * @param {number} [minstep] The minimum allowed step size between bins.
   * @param {number} [step] The exact step size to use between bins.
   *  If specified, the maxbins and minstep arguments are ignored.
   * @return {[number, number, number]} The bin [min, max, and step] values.
   */
  // @ts-ignore
  bins: (field, maxbins, nice, minstep, step) => op(
    'bins',
    field,
    [maxbins, nice, minstep, step]
  ),

  /**
   * Window function to assign consecutive row numbers, starting from 1.
   * @return {number} The row number value.
   */
  // @ts-ignore
  row_number: () => op('row_number'),

  /**
   * Window function to assign a rank to each value in a group, starting
   * from 1. Peer values are assigned the same rank. Subsequent ranks
   * reflect the number of prior values: if the first two values tie for
   * rank 1, the third value is assigned rank 3.
   * @return {number} The rank value.
   */
  // @ts-ignore
  rank: () => op('rank'),

  /**
   * Window function to assign a fractional (average) rank to each value in
   * a group, starting from 1. Peer values are assigned the average of their
   * indices: if the first two values tie, both will be assigned rank 1.5.
   * @return {number} The peer-averaged rank value.
   */
  // @ts-ignore
  avg_rank: () => op('avg_rank'),

  /**
   * Window function to assign a dense rank to each value in a group,
   * starting from 1. Peer values are assigned the same rank. Subsequent
   * ranks do not reflect the number of prior values: if the first two
   * values tie for rank 1, the third value is assigned rank 2.
   * @return {number} The dense rank value.
   */
  // @ts-ignore
  dense_rank: () => op('dense_rank'),

  /**
   * Window function to assign a percentage rank to each value in a group.
   * The percent is calculated as (rank - 1) / (group_size - 1).
   * @return {number} The percentage rank value.
   */
  // @ts-ignore
  percent_rank: () => op('percent_rank'),

  /**
   * Window function to assign a cumulative distribution value between 0 and 1
   * to each value in a group.
   * @return {number} The cumulative distribution value.
   */
  // @ts-ignore
  cume_dist: () => op('cume_dist'),

  /**
   * Window function to assign a quantile (e.g., percentile) value to each
   * value in a group. Accepts an integer parameter indicating the number of
   * buckets to use (e.g., 100 for percentiles, 5 for quintiles).
   * @param {number} num The number of buckets for ntile calculation.
   * @return {number} The quantile value.
   */
  // @ts-ignore
  ntile: (num) => op('ntile', null, num),

  /**
   * Window function to assign a value that precedes the current value by
   * a specified number of positions. If no such value exists, returns a
   * default value instead.
   * @template T
   * @param {T} field The data field.
   * @param {number} [offset=1] The lag offset from the current value.
   * @param {T} [defaultValue=undefined] The default value.
   * @return {T} The lagging value.
   */
  // @ts-ignore
  lag: (field, offset, defaultValue) => op('lag', field, [offset, defaultValue]),

  /**
   * Window function to assign a value that follows the current value by
   * a specified number of positions. If no such value exists, returns a
   * default value instead.
   * @template T
   * @param {T} field The data field.
   * @param {number} [offset=1] The lead offset from the current value.
   * @param {T} [defaultValue=undefined] The default value.
   * @return {T} The leading value.
   */
  // @ts-ignore
  lead: (field, offset, defaultValue) => op('lead', field, [offset, defaultValue]),

  /**
   * Window function to assign the first value in a sliding window frame.
   * @template T
   * @param {T} field The data field.
   * @return {T} The first value in the current frame.
   */
  // @ts-ignore
  first_value: (field) => op('first_value', field),

  /**
   * Window function to assign the last value in a sliding window frame.
   * @template T
   * @param {T} field The data field.
   * @return {T} The last value in the current frame.
   */
  // @ts-ignore
  last_value: (field) => op('last_value', field),

  /**
   * Window function to assign the nth value in a sliding window frame
   * (counting from 1), or undefined if no such value exists.
   * @template T
   * @param {T} field The data field.
   * @param {number} nth The nth position, starting from 1.
   * @return {T} The nth value in the current frame.
   */
  // @ts-ignore
  nth_value: (field, nth) => op('nth_value', field, nth),

  /**
   * Window function to fill in missing values with preceding values.
   * @template T
   * @param {T} field The data field.
   * @param {T} [defaultValue=undefined] The default value.
   * @return {T} The current value if valid, otherwise the first preceding
   *  valid value. If no such value exists, returns the default value.
   */
  // @ts-ignore
  fill_down: (field, defaultValue) => op('fill_down', field, defaultValue),

  /**
   * Window function to fill in missing values with subsequent values.
   * @template T
   * @param {T} field The data field.
   * @param {T} [defaultValue=undefined] The default value.
   * @return {T} The current value if valid, otherwise the first subsequent
   *  valid value. If no such value exists, returns the default value.
   */
  // @ts-ignore
  fill_up: (field, defaultValue) => op('fill_up', field, defaultValue)
};

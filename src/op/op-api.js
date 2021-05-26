import functions from './functions';
import op from './op';

export const any = (field) => op('any', field);
export const count = () => op('count');
export const array_agg = (field) => op('array_agg', field);
export const array_agg_distinct = (field) => op('array_agg_distinct', field);
export const map_agg = (key, value) => op('map_agg', [key, value]);
export const object_agg = (key, value) => op('object_agg', [key, value]);
export const entries_agg = (key, value) => op('entries_agg', [key, value]);

/**
 * @typedef {import('../table/transformable').Struct} Struct
 */

/**
 * All table expression operations including normal functions,
 * aggregate functions, and window functions.
 */
export default {
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
   * @param {*} field The data field.
   * @return {*} An arbitrary observed value.
   */
  any,

  /**
   * Aggregate function to collect an array of values.
   * @param {*} field The data field.
   * @return {Array} A list of values.
   */
  array_agg,

  /**
   * Aggregate function to collect an array of distinct (unique) values.
   * @param {*} field The data field.
   * @return {Array} An array of unique values.
   */
  array_agg_distinct,

  /**
   * Aggregate function to create an object given input key and value fields.
   * @param {*} key The object key field.
   * @param {*} value The object value field.
   * @return {Struct} An object of key-value pairs.
   */
  object_agg,

  /**
   * Aggregate function to create a Map given input key and value fields.
   * @param {*} key The object key field.
   * @param {*} value The object value field.
   * @return {Map} A Map of key-value pairs.
   */
  map_agg,

  /**
   * Aggregate function to create an array in the style of Object.entries()
   * given input key and value fields.
   * @param {*} key The object key field.
   * @param {*} value The object value field.
   * @return {[[any, any]]} An array of [key, value] arrays.
   */
  entries_agg,

  /**
   * Aggregate function to count the number of valid values.
   * Invalid values are null, undefined, or NaN.
   * @param {*} field The data field.
   * @return {number} The count of valid values.
   */
  valid: (field) => op('valid', field),

  /**
   * Aggregate function to count the number of invalid values.
   * Invalid values are null, undefined, or NaN.
   * @param {*} field The data field.
   * @return {number} The count of invalid values.
   */
  invalid: (field) => op('invalid', field),

  /**
   * Aggregate function to count the number of distinct values.
   * @param {*} field The data field.
   * @return {number} The count of distinct values.
   */
  distinct: (field) => op('distinct', field),

  /**
   * Aggregate function to determine the mode (most frequent) value.
   * @param {*} field The data field.
   * @return {number} The mode value.
   */
  mode: (field) => op('mode', field),

  /**
   * Aggregate function to sum values.
   * @param {string} field The data field.
   * @return {number} The sum of the values.
   */
  sum: (field) => op('sum', field),

  /**
   * Aggregate function to multiply values.
   * @param {*} field The data field.
   * @return {number} The product of the values.
   */
  product: (field) => op('product', field),

  /**
   * Aggregate function for the mean (average) value.
   * @param {*} field The data field.
   * @return {number} The mean (average) of the values.
   */
  mean: (field) => op('mean', field),

  /**
   * Aggregate function for the average (mean) value.
   * @param {*} field The data field.
   * @return {number} The average (mean) of the values.
   */
  average: (field) => op('average', field),

  /**
   * Aggregate function for the sample variance.
   * @param {*} field The data field.
   * @return {number} The sample variance of the values.
   */
  variance: (field) => op('variance', field),

  /**
   * Aggregate function for the population variance.
   * @param {*} field The data field.
   * @return {number} The population variance of the values.
   */
  variancep: (field) => op('variancep', field),

  /**
   * Aggregate function for the sample standard deviation.
   * @param {*} field The data field.
   * @return {number} The sample standard deviation of the values.
   */
  stdev: (field) => op('stdev', field),

  /**
   * Aggregate function for the population standard deviation.
   * @param {*} field The data field.
   * @return {number} The population standard deviation of the values.
   */
  stdevp: (field) => op('stdevp', field),

  /**
   * Aggregate function for the minimum value.
   * @param {*} field The data field.
   * @return {number} The minimum value.
   */
  min: (field) => op('min', field),

  /**
   * Aggregate function for the maximum value.
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
   * Aggregate function for the median value.
   * This is a shorthand for the 0.5 quantile value.
   * @param {*} field The data field.
   * @return {number} The median value.
   */
  median: (field) => op('median', field),

  /**
   * Aggregate function for the sample covariance between two variables.
   * @param {*} field1 The first data field.
   * @param {*} field2 The second data field.
   * @return {number} The sample covariance of the values.
   */
  covariance: (field1, field2) => op('covariance', [field1, field2]),

  /**
   * Aggregate function for the population covariance between two variables.
   * @param {*} field1 The first data field.
   * @param {*} field2 The second data field.
   * @return {number} The population covariance of the values.
   */
  covariancep: (field1, field2) => op('covariancep', [field1, field2]),

  /**
   * Aggregate function for the product-moment correlation between two variables.
   * To instead compute a rank correlation, compute the average ranks for each
   * variable and then apply this function to the result.
   * @param {*} field1 The first data field.
   * @param {*} field2 The second data field.
   * @return {number} The correlation between the field values.
   */
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
  nth_value: (field, nth) => op('nth_value', field, nth),

  /**
   * Window function to fill in missing values with preceding values.
   * @param {*} field The data field.
   * @param {*} [defaultValue=undefined] The default value.
   * @return {*} The current value if valid, otherwise the first preceding
   *  valid value. If no such value exists, returns the default value.
   */
  fill_down: (field, defaultValue) => op('fill_down', field, defaultValue),

  /**
   * Window function to fill in missing values with subsequent values.
   * @param {*} field The data field.
   * @param {*} [defaultValue=undefined] The default value.
   * @return {*} The current value if valid, otherwise the first subsequent
   *  valid value. If no such value exists, returns the default value.
   */
  fill_up: (field, defaultValue) => op('fill_up', field, defaultValue)
};
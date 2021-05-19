import bins from '../util/bins';
import distinctMap from '../util/distinct-map';
import isBigInt from '../util/is-bigint';
import noop from '../util/no-op';
import NULL from '../util/null';
import product from '../util/product';

/**
 * Initialize an aggregate operator.
 */
function initOp(op) {
  op.init = op.init || noop;
  op.add = op.add || noop;
  op.rem = op.rem || noop;
  return op;
}

function initProduct(s, value) {
  s.product_v = false;
  return s.product = value;
}

/**
 * Initialize an aggregate operator.
 * @callback AggregateInit
 * @param {object} state The aggregate state object.
 * @return {void}
 */

/**
 * Add a value to an aggregate operator.
 * @callback AggregateAdd
 * @param {object} state The aggregate state object.
 * @param {*} value The value to add.
 * @return {void}
 */

/**
 * Remove a value from an aggregate operator.
 * @callback AggregateRem
 * @param {object} state The aggregate state object.
 * @param {*} value The value to remove.
 * @return {void}
 */

/**
 * Retrive an output value from an aggregate operator.
 * @callback AggregateValue
 * @param {object} state The aggregate state object.
 * @return {*} The output value.
 */

/**
 * An operator instance for an aggregate function.
 * @typedef {object} AggregateOperator
 * @property {AggregateInit} init Initialize the operator.
 * @property {AggregateAdd} add Add a value to the operator state.
 * @property {AggregateRem} rem Remove a value from the operator state.
 * @property {AggregateValue} value Retrieve an output value.
 */

/**
 * Create a new aggregate operator instance.
 * @callback AggregateCreate
 * @param {...any} params The aggregate operator parameters.
 * @return {AggregateOperator} The instantiated aggregate operator.
 */

/**
 * An operator definition for an aggregate function.
 * @typedef {object} AggregateDef
 * @property {AggregateCreate} create Create a new operator instance.
 * @property {number[]} param Two-element array containing the
 *  counts of input fields and additional parameters.
 * @property {string[]} [req] Names of operators required by this one.
 * @property {string[]} [stream] Names of operators required by this one
 *  for streaming operations (value removes).
 */

/**
 * Aggregate operator definitions.
 */
export default {
  /** @type {AggregateDef} */
  count: {
    create: () => initOp({
      value: s => s.count
    }),
    param: []
  },

  /** @type {AggregateDef} */
  array_agg: {
    create: () => initOp({
      init: s => s.values = true,
      value: s => s.list.values(s.stream)
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  object_agg: {
    create: () => initOp({
      init:  s => s.values = true,
      value: s => Object.fromEntries(s.list.values())
    }),
    param: [2]
  },

  /** @type {AggregateDef} */
  map_agg: {
    create: () => initOp({
      init:  s => s.values = true,
      value: s => new Map(s.list.values())
    }),
    param: [2]
  },

  /** @type {AggregateDef} */
  entries_agg: {
    create: () => initOp({
      init:  s => s.values = true,
      value: s => s.list.values(s.stream)
    }),
    param: [2]
  },

  /** @type {AggregateDef} */
  any: {
    create: () => initOp({
      add: (s, v) => { if (s.any == null) s.any = v; },
      value: s => s.valid ? s.any : NULL
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  valid: {
    create: () => initOp({
      value: s => s.valid
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  invalid: {
    create: () => initOp({
      value: s => s.count - s.valid
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  distinct: {
    create: () => ({
      init: s => s.distinct = distinctMap(),
      value: s => s.distinct.count() + (s.valid === s.count ? 0 : 1),
      add: (s, v) => s.distinct.increment(v),
      rem: (s, v) => s.distinct.decrement(v)
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  array_agg_distinct: {
    create: () => initOp({
      value: s => s.distinct.values()
    }),
    param: [1],
    req: ['distinct']
  },

  /** @type {AggregateDef} */
  mode: {
    create: () => initOp({
      value: s => {
        let mode = NULL;
        let max = 0;
        s.distinct.forEach((value, count) => {
          if (count > max) {
            max = count;
            mode = value;
          }
        });
        return mode;
      }
    }),
    param: [1],
    req: ['distinct']
  },

  /** @type {AggregateDef} */
  sum: {
    create: () => ({
      init:  s => s.sum = 0,
      value: s => s.valid ? s.sum : NULL,
      add: (s, v) => isBigInt(v)
        ? (s.sum === 0 ? s.sum = v : s.sum += v)
        : s.sum += +v,
      rem: (s, v) => s.sum -= v
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  product: {
    create: () => ({
      init:  s => initProduct(s, 1),
      value: s => s.valid
        ? (
            s.product_v
              ? initProduct(s, product(s.list.values()))
              : s.product
          )
        : undefined,
      add: (s, v) => isBigInt(v)
        ? (s.product === 1 ? s.product = v : s.product *= v)
        : s.product *= v,
      rem: (s, v) => (v == 0 || v === Infinity || v === -Infinity)
        ? s.product_v = true
        : s.product /= v
    }),
    param: [1],
    stream: ['array_agg']
  },

  /** @type {AggregateDef} */
  mean: {
    create: () => ({
      init: s => s.mean = 0,
      value: s => s.valid ? s.mean : NULL,
      add: (s, v) => {
        s.mean_d = v - s.mean;
        s.mean += s.mean_d / s.valid;
      },
      rem: (s, v) => {
        s.mean_d = v - s.mean;
        s.mean -= s.valid ? s.mean_d / s.valid : s.mean;
      }
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  average: {
    create: () => initOp({
      value: s => s.valid ? s.mean : NULL
    }),
    param: [1],
    req: ['mean']
  },

  /** @type {AggregateDef} */
  variance: {
    create: () => ({
      init:  s => s.dev = 0,
      value: s => s.valid > 1 ? s.dev / (s.valid - 1) : NULL,
      add: (s, v) => s.dev += s.mean_d * (v - s.mean),
      rem: (s, v) => s.dev -= s.mean_d * (v - s.mean)
    }),
    param: [1],
    req: ['mean']
  },

  /** @type {AggregateDef} */
  variancep: {
    create: () => initOp({
      value: s => s.valid > 1 ? s.dev / s.valid : NULL
    }),
    param: [1],
    req: ['variance']
  },

  /** @type {AggregateDef} */
  stdev: {
    create: () => initOp({
      value: s => s.valid > 1 ? Math.sqrt(s.dev / (s.valid - 1)) : NULL
    }),
    param: [1],
    req: ['variance']
  },

  /** @type {AggregateDef} */
  stdevp: {
    create: () => initOp({
      value: s => s.valid > 1 ? Math.sqrt(s.dev / s.valid) : NULL
    }),
    param: [1],
    req: ['variance']
  },

  /** @type {AggregateDef} */
  min: {
    create: () => ({
      init:  s => s.min = NULL,
      value: s => s.min = (Number.isNaN(s.min) ? s.list.min() : s.min),
      add: (s, v) => { if (v < s.min || s.min === NULL) s.min = v; },
      rem: (s, v) => { if (v <= s.min) s.min = NaN; }
    }),
    param: [1],
    stream: ['array_agg']
  },

  /** @type {AggregateDef} */
  max: {
    create: () => ({
      init:  s => s.max = NULL,
      value: s => s.max = (Number.isNaN(s.max) ? s.list.max() : s.max),
      add: (s, v) => { if (v > s.max || s.max === NULL) s.max = v; },
      rem: (s, v) => { if (v >= s.max) s.max = NaN; }
    }),
    param: [1],
    stream: ['array_agg']
  },

  /** @type {AggregateDef} */
  quantile: {
    create: (p) => initOp({
      value: s => s.list.quantile(p)
    }),
    param: [1, 1],
    req: ['array_agg']
  },

  /** @type {AggregateDef} */
  median: {
    create: () => initOp({
      value: s => s.list.quantile(0.5)
    }),
    param: [1],
    req: ['array_agg']
  },

  /** @type {AggregateDef} */
  covariance: {
    create: () => ({
      init:  s => {
        s.cov = s.mean_x = s.mean_y = s.dev_x = s.dev_y = 0;
      },
      value: s => s.valid > 1 ? s.cov / (s.valid - 1) : NULL,
      add: (s, x, y) => {
        const dx = x - s.mean_x;
        const dy = y - s.mean_y;
        s.mean_x += dx / s.valid;
        s.mean_y += dy / s.valid;
        const dy2 = y - s.mean_y;
        s.dev_x += dx * (x - s.mean_x);
        s.dev_y += dy * dy2;
        s.cov += dx * dy2;
      },
      rem: (s, x, y) => {
        const dx = x - s.mean_x;
        const dy = y - s.mean_y;
        s.mean_x -= s.valid ? dx / s.valid : s.mean_x;
        s.mean_y -= s.valid ? dy / s.valid : s.mean_y;
        const dy2 = y - s.mean_y;
        s.dev_x -= dx * (x - s.mean_x);
        s.dev_y -= dy * dy2;
        s.cov -= dx * dy2;
      }
    }),
    param: [2]
  },

  /** @type {AggregateDef} */
  covariancep: {
    create: () => initOp({
      value: s => s.valid > 1 ? s.cov / s.valid : NULL
    }),
    param: [2],
    req: ['covariance']
  },

  /** @type {AggregateDef} */
  corr: {
    create: () => initOp({
      value: s => s.valid > 1
        ? s.cov / (Math.sqrt(s.dev_x) * Math.sqrt(s.dev_y))
        : NULL
    }),
    param: [2],
    req: ['covariance']
  },

  /** @type {AggregateDef} */
  bins: {
    create: (maxbins, nice, minstep, step) => initOp({
      value: s => bins(s.min, s.max, maxbins, nice, minstep, step)
    }),
    param: [1, 4],
    req: ['min', 'max']
  }
};
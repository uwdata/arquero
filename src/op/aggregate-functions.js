import bins from '../util/bins';
import noop from '../util/no-op';
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

/**
 * Initialize an aggregate operator.
 * @callback AggregateInit
 * @param {Object} state The aggregate state object.
 * @return {void}
 */

/**
 * Add a value to an aggregate operator.
 * @callback AggregateAdd
 * @param {Object} state The aggregate state object.
 * @param {*} value The value to add.
 * @return {void}
 */

/**
 * Remove a value from an aggregate operator.
 * @callback AggregateRem
 * @param {Object} state The aggregate state object.
 * @param {*} value The value to remove.
 * @return {void}
 */

/**
 * Retrive an output value from an aggregate operator.
 * @callback AggregateValue
 * @param {Object} state The aggregate state object.
 * @return {*} The output value.
 */

/**
 * An operator instance for an aggregate function.
 * @typedef {Object} AggregateOperator
 * @property {AggregateInit} init Initialize the operator.
 * @property {AggregateAdd} add Add a value to the operator state.
 * @property {AggregateRem} rem Remove a value from the operator state.
 * @property {AggregateValue} value Retrieve an output value.
 */

/**
 * Create a new aggregate operator instance.
 * @callback AggregateCreate
 * @param {...any} [params] The aggregate operator parameters.
 * @return {AggregateOperator} The instantiated aggregate operator.
 */

/**
 * An operator definition for an aggregate function.
 * @typedef {Object} AggregateDef
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
  values: {
    create: () => initOp({
      init: s => s.values = true,
      value: s => s.list.values()
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  any: {
    create: () => initOp({
      add: (s, v) => { if (s.any == null) s.any = v; },
      value: s => s.valid ? s.any : undefined
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
      init: s => {
        s.counts = new Map();
        s.distinct = 0;
      },
      value: s => s.distinct + (s.valid === s.count ? 0 : 1),
      add: (s, v) => {
        const count = s.counts.get(v) || -1;
        s.counts.set(v, count + 1);
        if (count < 0) ++s.distinct;
      },
      rem: (s, v) => {
        const count = s.counts.get(v);
        if (count === 1) {
          --s.distinct;
          s.counts.delete(v);
        } else {
          s.counts.set(v, count - 1);
        }
      }
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  unique: {
    create: () => initOp({
      value: s => Array.from(s.counts.keys())
    }),
    param: [1],
    req: ['distinct']
  },

  /** @type {AggregateDef} */
  mode: {
    create: () => initOp({
      value: s => {
        let mode = undefined;
        let max = 0;
        for (const [value, count] of s.counts) {
          if (count > max) {
            max = count;
            mode = value;
          }
        }
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
      value: s => s.sum,
      add: (s, v) => s.sum += +v,
      rem: (s, v) => s.sum -= v
    }),
    param: [1]
  },

  /** @type {AggregateDef} */
  product: {
    create: () => ({
      init:  s => s.product = 1,
      value: s => s.valid
        ? s.product = (Number.isNaN(s.product) ? product(s.list.values()) : s.product)
        : undefined,
      add: (s, v) => s.product *= v,
      rem: (s, v) => s.product /= v
    }),
    param: [1],
    stream: ['values']
  },

  /** @type {AggregateDef} */
  mean: {
    create: () => ({
      init: s => s.mean = 0,
      value: s => s.valid ? s.mean : undefined,
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
      value: s => s.valid ? s.mean : undefined
    }),
    param: [1],
    req: ['mean']
  },

  /** @type {AggregateDef} */
  variance: {
    create: () => ({
      init:  s => s.dev = 0,
      value: s => s.valid > 1 ? s.dev / (s.valid - 1) : undefined,
      add: (s, v) => s.dev += s.mean_d * (v - s.mean),
      rem: (s, v) => s.dev -= s.mean_d * (v - s.mean)
    }),
    param: [1],
    req: ['mean']
  },

  /** @type {AggregateDef} */
  variancep: {
    create: () => initOp({
      value: s => s.valid > 1 ? s.dev / s.valid : undefined
    }),
    param: [1],
    req: ['variance']
  },

  /** @type {AggregateDef} */
  stdev: {
    create: () => initOp({
      value: s => s.valid > 1 ? Math.sqrt(s.dev / (s.valid - 1)) : undefined
    }),
    param: [1],
    req: ['variance']
  },

  /** @type {AggregateDef} */
  stdevp: {
    create: () => initOp({
      value: s => s.valid > 1 ? Math.sqrt(s.dev / s.valid) : undefined
    }),
    param: [1],
    req: ['variance']
  },

  /** @type {AggregateDef} */
  min: {
    create: () => ({
      init:  s => s.min = undefined,
      value: s => s.min = (Number.isNaN(s.min) ? s.list.min() : s.min),
      add: (s, v) => { if (v < s.min || s.min === undefined) s.min = v; },
      rem: (s, v) => { if (v <= s.min) s.min = NaN; }
    }),
    param: [1],
    stream: ['values']
  },

  /** @type {AggregateDef} */
  max: {
    create: () => ({
      init:  s => s.max = undefined,
      value: s => s.max = (Number.isNaN(s.max) ? s.list.max() : s.max),
      add: (s, v) => { if (v > s.max || s.max === undefined) s.max = v; },
      rem: (s, v) => { if (v >= s.max) s.max = NaN; }
    }),
    param: [1],
    stream: ['values']
  },

  /** @type {AggregateDef} */
  quantile: {
    create: (p) => initOp({
      value: s => s.list.quantile(p)
    }),
    param: [1, 1],
    req: ['values']
  },

  /** @type {AggregateDef} */
  median: {
    create: () => initOp({
      value: s => s.list.quantile(0.5)
    }),
    param: [1],
    req: ['values']
  },

  /** @type {AggregateDef} */
  covariance: {
    create: () => ({
      init:  s => {
        s.cov = s.mean_x = s.mean_y = s.dev_x = s.dev_y = 0;
      },
      value: s => s.valid > 1 ? s.cov / (s.valid - 1) : undefined,
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
      value: s => s.valid > 1 ? s.cov / s.valid : undefined
    }),
    param: [2],
    req: ['covariance']
  },

  /** @type {AggregateDef} */
  corr: {
    create: () => initOp({
      value: s => s.valid > 1
        ? s.cov / (Math.sqrt(s.dev_x) * Math.sqrt(s.dev_y))
        : undefined
    }),
    param: [2],
    req: ['covariance']
  },

  /** @type {AggregateDef} */
  bins: {
    create: (maxbins, nice, minstep) => initOp({
      value: s => bins(s.min, s.max, maxbins, nice, minstep)
    }),
    param: [1, 3],
    req: ['min', 'max']
  }
};
import error from '../util/error';
import noop from '../util/no-op';

/**
 * Initialize a window operator.
 * @callback WindowInit
 * @return {void}
 */

/**
 * Retrieve an output value from a window operator.
 * @callback WindowValue
 * @param {WindowState} state The window state object.
 * @return {*} The output value.
 */

/**
 * An operator instance for a window function.
 * @typedef {Object} WindowOperator
 * @property {AggregateInit} init Initialize the operator.
 * @property {AggregateValue} value Retrieve an output value.
 */

/**
 * Create a new window operator instance.
 * @callback WindowCreate
 * @param {...any} [params] The aggregate operator parameters.
 * @return {WindowOperator} The instantiated window operator.
 */

/**
 * An operator definition for a window function.
 * @typedef {Object} WindowDef
 * @property {AggregateCreate} create Create a new operator instance.
 * @property {number[]} param Two-element array containing the
 *  counts of input fields and additional parameters.
 */

const rank = {
  create() {
    let rank;
    return {
      init: () => rank = 1,
      value: w => {
        const i = w.index;
        return (i && !w.peer(i)) ? (rank = i + 1) : rank;
      }
    };
  },
  param: []
};

const cume_dist = {
  create() {
    let cume;
    return {
      init: () => cume = 0,
      value: w => {
        let { index: i, peer, size } = w;
        if (cume < i) {
          while (i + 1 < size && peer(i + 1)) ++i;
          cume = i;
        }
        return (1 + cume) / size;
      }
    };
  },
  param: []
};

/**
 * Window operator definitions.
 */
export default {
  /** @type {WindowDef} */
  row_number: {
    create() {
      return {
        init: noop,
        value: w => w.index + 1
      };
    },
    param: []
  },

  /** @type {WindowDef} */
  rank,

  /** @type {WindowDef} */
  avg_rank: {
    create() {
      let j, rank;
      return {
        init: () => (j = -1, rank = 1),
        value: w => {
          const i = w.index;
          if (i >= j) {
            for (rank = j = i + 1; w.peer(j); rank += ++j);
            rank /= (j - i);
          }
          return rank;
        }
      };
    },
    param: []
  },

  /** @type {WindowDef} */
  dense_rank: {
    create() {
      let drank;
      return {
        init: () => drank = 1,
        value: w => {
          const i = w.index;
          return (i && !w.peer(i)) ? ++drank : drank;
        }
      };
    },
    param: []
  },

  /** @type {WindowDef} */
  percent_rank: {
    create() {
      const { init, value } = rank.create();
      return {
        init,
        value: w => (value(w) - 1) / (w.size - 1)
      };
    },
    param: []
  },

  /** @type {WindowDef} */
  cume_dist,

  /** @type {WindowDef} */
  ntile: {
    create(num) {
      num = +num;
      if (!(num > 0)) error('ntile num must be greater than zero.');
      const { init, value } = cume_dist();
      return {
        init,
        value: w => Math.ceil(num * value(w))
      };
    },
    param: [0, 1]
  },

  /** @type {WindowDef} */
  lag: {
    create(offset, defaultValue) {
      offset = +offset || 1;
      return {
        init: noop,
        value: (w, f) => {
          const i = w.index - offset;
          return i >= 0 ? w.value(i, f) : defaultValue;
        }
      };
    },
    param: [1, 2]
  },

  /** @type {WindowDef} */
  lead: {
    create(offset, defaultValue) {
      offset = +offset || 1;
      return {
        init: noop,
        value: (w, f) => {
          let i = w.index + offset;
          return i < w.size ? w.value(i, f) : defaultValue;
        }
      };
    },
    param: [1, 2]
  },

  /** @type {WindowDef} */
  first_value: {
    create() {
      return {
        init: noop,
        value: (w, f) => w.value(w.i0, f)
      };
    },
    param: [1]
  },

  /** @type {WindowDef} */
  last_value: {
    create() {
      return {
        init: noop,
        value: (w, f) => w.value(w.i1 - 1, f)
      };
    },
    param: [1]
  },

  /** @type {WindowDef} */
  nth_value: {
    create(nth) {
      nth = +nth;
      if (!(nth > 0)) error('nth_value nth must be greater than zero.');
      return {
        init: noop,
        value: (w, f) => {
          let i = w.i0 + (nth - 1);
          return i < w.i1 ? w.value(i, f) : undefined;
        }
      };
    },
    param: [1, 1]
  }
};
import __dedupe from './dedupe.js';
import __derive from './derive.js';
import __except from './except.js';
import __filter from './filter.js';
import __fold from './fold.js';
import __impute from './impute.js';
import __intersect from './intersect.js';
import __join from './join.js';
import __semijoin from './join-filter.js';
import __lookup from './lookup.js';
import __pivot from './pivot.js';
import __relocate from './relocate.js';
import __rename from './rename.js';
import __rollup from './rollup.js';
import __sample from './sample.js';
import __select from './select.js';
import __spread from './spread.js';
import __union from './union.js';
import __unroll from './unroll.js';
import __groupby from './groupby.js';
import __orderby from './orderby.js';

import __concat from '../engine/concat.js';
import __reduce from '../engine/reduce.js';
import __ungroup from '../engine/ungroup.js';
import __unorder from '../engine/unorder.js';

import { count } from '../op/op-api.js';

export default {
  __antijoin: (table, other, on) =>
    __semijoin(table, other, on, { anti: true }),
  __count: (table, options = {}) =>
    __rollup(table, { [options.as || 'count']: count() }),
  __cross: (table, other, values, options) =>
    __join(table, other, () => true, values, {
      ...options, left: true, right: true
    }),
  __concat,
  __dedupe,
  __derive,
  __except,
  __filter,
  __fold,
  __impute,
  __intersect,
  __join,
  __lookup,
  __pivot,
  __relocate,
  __rename,
  __rollup,
  __sample,
  __select,
  __semijoin,
  __spread,
  __union,
  __unroll,
  __groupby,
  __orderby,
  __ungroup,
  __unorder,
  __reduce
};

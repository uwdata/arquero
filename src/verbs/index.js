import __dedupe from './dedupe';
import __derive from './derive';
import __except from './except';
import __filter from './filter';
import __fold from './fold';
import __impute from './impute';
import __intersect from './intersect';
import __join from './join';
import __semijoin from './join-filter';
import __lookup from './lookup';
import __pivot from './pivot';
import __relocate from './relocate';
import __rename from './rename';
import __rollup from './rollup';
import __sample from './sample';
import __select from './select';
import __spread from './spread';
import __union from './union';
import __unroll from './unroll';
import __groupby from './groupby';
import __orderby from './orderby';

import __concat from '../engine/concat';
import __reduce from '../engine/reduce';
import __ungroup from '../engine/ungroup';
import __unorder from '../engine/unorder';

import { count } from '../op/op-api';

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
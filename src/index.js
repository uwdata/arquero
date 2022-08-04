// export internal class definitions
import Table from './table/table';
import { columnFactory } from './table/column';
import ColumnTable from './table/column-table';
import Transformable from './table/transformable';
import Reducer from './engine/reduce/reducer';
import parse from './expression/parse';
import walk_ast from './expression/ast/walk';
import Query from './query/query';
import { Verb, Verbs } from './query/verb';

export const internal = {
  Table,
  ColumnTable,
  Transformable,
  Query,
  Reducer,
  Verb,
  Verbs,
  columnFactory,
  parse,
  walk_ast
};

// export public API
import pkg from '../package.json';
export const version = pkg.version;
export { seed } from './util/random';
export { default as fromArrow } from './format/from-arrow';
export { default as fromCSV } from './format/from-csv';
export { default as fromFixed } from './format/from-fixed';
export { default as fromJSON } from './format/from-json';
export { load, loadArrow, loadCSV, loadFixed, loadJSON } from './format/load-url';
export { default as toArrow } from './arrow/encode';
export { default as bin } from './helpers/bin';
export { default as escape } from './helpers/escape';
export { default as desc } from './helpers/desc';
export { default as field } from './helpers/field';
export { default as frac } from './helpers/frac';
export { default as names } from './helpers/names';
export { default as rolling } from './helpers/rolling';
export { all, endswith, matches, not, range, startswith } from './helpers/selection';
export { default as agg } from './verbs/helpers/agg';
export { default as op } from './op/op-api';
export { query, queryFrom } from './query/query';
export * from './register';
export * from './table';

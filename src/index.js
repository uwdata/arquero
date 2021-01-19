// export internal class definitions
import Table from './table/table';
import { columnFactory } from './table/column';
import ColumnTable from './table/column-table';
import Reducer from './engine/reduce/reducer';
import parse from './expression/parse';
import walk_ast from './expression/ast/walk';
import Query from './query/query';
import { Verbs } from './query/verb';

export const internal = {
  Table,
  ColumnTable,
  Query,
  Reducer,
  Verbs,
  columnFactory,
  parse,
  walk_ast
};

// export public API
export { version } from '../package.json';
export { seed } from './util/random';
export { default as fromArrow } from './format/from-arrow';
export { default as fromCSV } from './format/from-csv';
export { default as fromJSON } from './format/from-json';
export { query, queryFrom } from './query/query';
export * from './op/register';
export * from './verbs';
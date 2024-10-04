import { Table } from './Table.js';
import { BitSet } from './BitSet.js';

/** A table column value. */
export type DataValue = any;

/**
 * Interface for table columns.
 * Compatible with arrays, typed arrays, and Arrow columns.
 */
export interface ColumnType<T> {
  /** The number of rows in the column. */
  length: number;
  /** Retrieve the value at the given row index. */
  at(row: number): T;
  /** Return a column value iterator. */
  [Symbol.iterator]() : Iterator<T>;
  /** Optional toArray method. */
  toArray?() : ColumnType<T>;
}

/** A named collection of columns. */
export type ColumnData = Record<string, ColumnType<DataValue>>;

/** Table expression parameters. */
export type Params = Record<string, any>;

/** A typed array constructor. */
export type TypedArrayConstructor =
  | Uint8ArrayConstructor
  | Uint16ArrayConstructor
  | Uint32ArrayConstructor
  | BigUint64ArrayConstructor
  | Int8ArrayConstructor
  | Int16ArrayConstructor
  | Int32ArrayConstructor
  | BigInt64ArrayConstructor
  | Float32ArrayConstructor
  | Float64ArrayConstructor;

/** A typed array instance. */
export type TypedArray =
  | Uint8Array
  | Uint16Array
  | Uint32Array
  | BigUint64Array
  | Int8Array
  | Int16Array
  | Int32Array
  | BigInt64Array
  | Float32Array
  | Float64Array;

/** Table row object. */
export type RowObject = Record<string, DataValue>;

/** A table groupby specification. */
export interface GroupBySpec {
  /** The number of groups. */
  size: number;
  /** Column names for each group. */
  names: string[];
  /** Value accessor functions for each group. */
  get: RowExpression[];
  /** Indices of an example table row for each group. */
  rows: number[] | Uint32Array;
  /** Per-row group indices, length is total rows of table. */
  keys: number[] | Uint32Array;
}

/** An expression evaluated over a table row. */
export type RowExpression = (
  /** The table row. */
  row: number,
  /** The backing table data store. */
  data: ColumnData
) => DataValue;

/** Column value accessor. */
export type ColumnGetter = (
  /** The table row. */
  row: number
) => DataValue;

/**
 * Comparator function for sorting table rows. Returns a negative value
 * if rowA < rowB, positive if rowA > rowB, otherwise zero.
 */
export type RowComparator = (
  /** The table row index for the first row. */
  rowA: number,
  /** The table row index for the second row. */
  rowB: number,
  /** The backing table data store. */
  data: ColumnData
) => number;

/** Options for derived table creation. */
export interface CreateOptions {
  /** The backing column data. */
  data?: ColumnData;
  /** An ordered list of column names. */
  names?: readonly string[];
  /** An additional filter BitSet to apply. */
  filter?: BitSet;
  /** The groupby specification to use, or null for no groups. */
  groups?: GroupBySpec;
  /** The orderby comparator function to use, or null for no order. */
  order?: RowComparator
}

/** Options for generating row objects. */
export interface PrintOptions {
  /** The maximum number of objects to create, default `Infinity`. */
  limit?: number;
  /** The row offset indicating how many initial rows to skip, default `0`. */
  offset?: number;
  /**
   * An ordered set of columns to include. The input may consist of column
   * name strings, column integer indices, objects with current column names
   * as keys and new column names as values (for renaming), or selection
   * helper functions such as *all*, *not*, or *range*.
   */
  columns?: Select;
}

/** Options for generating row objects. */
export interface ObjectsOptions {
  /** The maximum number of objects to create, default `Infinity`. */
  limit?: number;
  /** The row offset indicating how many initial rows to skip, default `0`. */
  offset?: number;
  /**
   * An ordered set of columns to include. The input may consist of column
   * name strings, column integer indices, objects with current column names
   * as keys and new column names as values (for renaming), or selection
   * helper functions such as *all*, *not*, or *range*.
   */
  columns?: Select;
  /**
   * The export format for groups of rows. The default (false) is to ignore
   * groups, returning a flat array of objects. The valid values are 'map' or
   * true (for Map instances), 'object' (for standard objects), or 'entries'
   * (for arrays in the style of Object.entries). For the 'object' format,
   * groupby keys are coerced to strings to use as object property names; note
   * that this can lead to undesirable behavior if the groupby keys are object
   * values. The 'map' and 'entries' options preserve the groupby key values.
   */
  grouped?: 'map' | 'entries' | 'object' | boolean;
}

/** A reference to a column by string name or integer index. */
export type ColumnRef = string | number;

/** A value that can be coerced to a string. */
export interface Stringable {
  /** String coercion method. */
  toString(): string;
}

/** A table expression provided as a string or string-coercible value. */
export type TableExprString = string | Stringable;

/** A struct object with arbitrary named properties. */
export type Struct = Record<string, any>;

/** A function defined over a table row. */
export type TableExprFunc = (d: Struct, $: Params) => any;

/** A table expression defined over a single table. */
export type TableExpr = TableExprFunc | TableExprString;

/** A function defined over rows from two tables. */
export type TableExprFunc2 = (a: Struct, b: Struct, $: Params) => any;

/** A table expression defined over two tables. */
export type TableExpr2 = TableExprFunc2 | TableExprString;

/** An object that maps current column names to new column names. */
export type RenameMap = Record<string, string>;

/** A selection helper function. */
export type SelectHelper = (table: Table) => string[];

/**
 * One or more column selections, potentially with renaming.
 * The input may consist of a column name string, column integer index, a
 * rename map object with current column names as keys and new column names
 * as values, or a select helper function that takes a table as input and
 * returns a valid selection parameter.
 */
export type SelectEntry = ColumnRef | RenameMap | SelectHelper;

/** An ordered set of column selections, potentially with renaming. */
export type Select = SelectEntry | SelectEntry[];

/** An object of column name / table expression pairs. */
export type ExprObject = Record<string, TableExpr>;

/** An object of column name / two-table expression pairs. */
export type Expr2Object = Record<string, TableExpr2>;

/** An ordered set of one or more column values. */
export type ListEntry = ColumnRef | SelectHelper | ExprObject;

/**
 * An ordered set of column values.
 * Entries may be column name strings, column index numbers, value objects
 * with output column names for keys and table expressions for values,
 * or a selection helper function.
 */
export type ExprList = ListEntry | ListEntry[];

/** A reference to a data table instance. */
export type TableRef = Table | string;

/** A list of one or more table references. */
export type TableRefList = TableRef | TableRef[];

/**
 * One or more orderby sort criteria.
 * If a string, order by the column with that name.
 * If a number, order by the column with that index.
 * If a function, must be a valid table expression; aggregate functions
 *  are permitted, but window functions are not.
 * If an object, object values must be valid values parameters
 *  with output column names for keys and table expressions
 *  for values. The output name keys will subsequently be ignored.
 */
export type OrderKey = ColumnRef | TableExpr | ExprObject;

/** An ordered set of orderby sort criteria, in precedence order. */
export type OrderKeys = OrderKey | OrderKey[];

/** Column values to use as a join key. */
export type JoinKey = ColumnRef | TableExprFunc;

/** An ordered set of join keys. */
export type JoinKeys =
  | JoinKey
  | [JoinKey[]]
  | [JoinKey, JoinKey]
  | [JoinKey[], JoinKey[]];

/** A predicate specification for joining two tables. */
export type JoinPredicate = JoinKeys | TableExprFunc2 | null;

/** An array of per-table join values to extract. */
export type JoinList =
  | [ExprList]
  | [ExprList, ExprList]
  | [ExprList, ExprList, Expr2Object];

/** A specification of join values to extract. */
export type JoinValues = JoinList | Expr2Object;

// -- Transform Options -----------------------------------------------------

/** Options for count transformations. */
export interface CountOptions {
  /** The name of the output count column, default `count`. */
  as?: string;
}

/** Options for derive transformations. */
export interface DeriveOptions {
  /**
   * A flag (default `false`) indicating if the original columns should be
   * dropped, leaving only the derived columns. If true, the before and after
   * options are ignored.
   */
  drop?: boolean;
  /**
   * An anchor column that relocated columns should be placed before.
   * The value can be any legal column selection. If multiple columns are
   * selected, only the first column will be used as an anchor.
   * It is an error to specify both before and after options.
   */
  before?: Select;
  /**
   * An anchor column that relocated columns should be placed after.
   * The value can be any legal column selection. If multiple columns are
   * selected, only the last column will be used as an anchor.
   * It is an error to specify both before and after options.
   */
  after?: Select;
}

/** Options for relocate transformations. */
export interface RelocateOptions {
  /**
   * An anchor column that relocated columns should be placed before.
   * The value can be any legal column selection. If multiple columns are
   * selected, only the first column will be used as an anchor.
   * It is an error to specify both before and after options.
   */
  before?: Select;
  /**
   * An anchor column that relocated columns should be placed after.
   * The value can be any legal column selection. If multiple columns are
   * selected, only the last column will be used as an anchor.
   * It is an error to specify both before and after options.
   */
  after?: Select;
}

/** Options for sample transformations. */
export interface SampleOptions {
  /** Flag for sampling with replacement (default `false`). */
  replace?: boolean;
  /** Flag to ensure randomly ordered rows (default `true`). */
  shuffle?: boolean;
  /**
   * Column values to use as weights for sampling. Rows will be sampled with
   * probability proportional to their relative weight. The input should be a
   * column name string or a table expression compatible with *derive*.
   */
  weight?: string | TableExprFunc;
}

/** Options for impute transformations. */
export interface ImputeOptions {
  /**
   * Column values to combine to impute missing rows. For column names and
   * indices, all unique column values are considered. Otherwise, each entry
   * should be an object of name-expresion pairs, with valid table expressions
   * for *rollup*. All combinations of values are checked for each set of
   * unique groupby values.
   */
  expand?: ExprList;
}

/** Options for fold transformations. */
export interface FoldOptions {
  /**
   * An array indicating the output column names to use for the key and value
   * columns, respectively. The default is `['key', 'value']`.
   */
  as?: string[];
}

/** Options for pivot transformations. */
export interface PivotOptions {
  /** The maximum number of new columns to generate (default `Infinity`). */
  limit?: number;
  /** A string to place between multiple key names (default `_`); */
  keySeparator?: string;
  /** A string to place between key and value names (default `_`). */
  valueSeparator?: string;
  /** Flag for alphabetical sorting of new column names (default `true`). */
  sort?: boolean;
}

/** Options for spread transformations. */
export interface SpreadOptions {
  /**
   * Flag (default `true`) indicating if input columns to the
   * spread operation should be dropped in the output table.
   */
  drop?: boolean;
  /** The maximum number of new columns to generate (default `Infinity`). */
  limit?: number;
  /**
   * Output column names to use. This option only applies when a single
   * column is spread. If the given array of names is shorter than the
   * number of generated columns and no limit option is specified, the
   * additional generated columns will be dropped.
   */
  as?: string[];
}

/** Options for unroll transformations. */
export interface UnrollOptions {
  /**
   * The maximum number of new rows to generate per array value
   * (default `Infinity`).
   */
  limit?: number;
  /**
   * Flag or column name to add zero-based array index values as an output
   * column (default `false`). If true, a column named "index" will be
   * included. If string-valued, a column with the given name will be added.
   */
  index?: boolean | string;
  /**
   * Columns to drop from the output. The input may consist of column name
   * strings, column integer indices, objects with column names as keys, or
   * functions that take a table as input and return a valid selection
   * parameter (typically the output of selection helper functions such as
   * *all*, *not*, or *range*.
   */
  drop?: Select;
}

/** Options for join transformations. */
export interface JoinOptions {
  /**
   * Flag indicating a left outer join (default `false`). If both the
   * *left* and *right* flags are true, indicates a full outer join.
   */
  left?: boolean;
  /**
   * Flag indicating a right outer join (default `false`). If both the
   * *left* and *right* flags are true, indicates a full outer join.
   */
  right?: boolean;
  /**
   * Column name suffixes to append if two columns with the same name are
   * produced by the join. The default is `['_1', '_2']`.
   */
  suffix?: string[];
}

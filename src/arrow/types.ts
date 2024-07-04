import { DataType, Table } from 'apache-arrow';
import type { Select, TypedArray } from '../table/types.js';

/** Arrow input data as bytes or loaded table. */
export type ArrowInput =
  | ArrayBuffer
  | TypedArray
  | Table;

/** Options for Apache Arrow import. */
export interface ArrowOptions {
  /**
   * An ordered set of columns to import. The input may consist of column name
   * strings, column integer indices, objects with current column names as
   * keys and new column names as values (for renaming), or selection helper
   * functions such as *all*, *not*, or *range*.
   */
  columns?: Select;
}

/** Options for Apache Arrow column conversion. */
export interface ArrowColumnOptions {
  /**
   * Flag (default `true`) to convert Arrow date values to JavaScript Date
   * objects. If false, defaults to what the Arrow implementation provides,
   * typically numeric timestamps as number values.
   */
  convertDate?: boolean;
  /**
   * Flag (default `true`) to convert Arrow fixed point decimal values to
   * JavaScript numbers. If false, defaults to what the Arrow implementation
   * provides, typically byte arrays. The conversion will be lossy if the
   * decimal can not be exactly represented as a double-precision floating
   * point number.
   */
  convertDecimal?: boolean;
  /**
   * Flag (default `true`) to convert Arrow timestamp values to JavaScript
   * Date objects. If false, defaults to what the Arrow implementation
   * provides, typically numeric timestamps as number values.
   */
  convertTimestamp?: boolean;
  /**
   * Flag (default `false`) to convert Arrow integers with bitwidths of 64
   * bits or higher to JavaScript numbers. If false, defaults to what the
   * Arrow implementation provides, typically `BigInt` values. The conversion
   * will be lossy if the integer is so large it can not be exactly
   * represented as a double-precision floating point number.
   */
  convertBigInt?: boolean;
  /**
   * A hint (default `true`) to enable memoization of expensive conversion.
   * If true, memoization is applied for string and nested (list, struct)
   * types, caching extracted values to enable faster access. Memoization
   * is also applied to converted Date values, in part to ensure exact object
   * equality. This hint is ignored for dictionary columns, whose values are
   * always memoized.
   */
  memoize?: boolean;
}

/** Options for Arrow encoding. */
export interface ArrowFormatOptions {
  /** The maximum number of rows to include (default `Infinity`). */
  limit?: number;
  /**
   * The row offset (default `0`) indicating how many initial rows to skip.
   */
  offset?: number;
  /**
   * Ordered list of column names to include. If function-valued, the
   * function should accept a dataset as input and return an array of
   * column name strings. If unspecified all columns are included.
   */
  columns?: string[] | ((data: any) => string[]);
  /**
   * The Arrow data types to use. If specified, the input should be an
   * object with column names for keys and Arrow data types for values.
   * If a column type is not explicitly provided, type inference will be
   * performed to guess an appropriate type.
   */
  types?: Record<string, DataType>;
}

/** Options for Arrow IPC encoding. */
export interface ArrowIPCFormatOptions extends ArrowFormatOptions {
  /**
   * The Arrow IPC byte format to use. One of `'stream'` (default) or `'file'`.
   */
  format?: 'stream' | 'file';
}

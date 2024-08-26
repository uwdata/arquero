import { ExtractionOptions } from '@uwdata/flechette';
import { DataType } from 'apache-arrow';
import type { ColumnType, Select } from '../table/types.js';

/** Arrow input data as bytes or loaded table. */
export type ArrowInput =
  | ArrayBuffer
  | Uint8Array
  | ArrowTable;

/** A column in an Apache Arrow table. */
export interface ArrowColumn<T> extends ColumnType<T> {
  type: ArrowDataType;
  nullCount: number;
  toArray(): ColumnType<T>
}

/** Minimal interface for an Arrow data type. */
export interface ArrowDataType {
  typeId: number;
}

/** A field definition with an Arrow schema. */
export interface ArrowField {
  name: string;
  nullable: boolean;
  type: ArrowDataType;
  metadata?: Map<string, string>;
}

/** An Apache Arrow table schema. */
export interface ArrowSchema {
  version?: number;
  fields: ArrowField[];
  metadata?: Map<string, string>;
}

/**
 * Interface for an Apache Arrow table.
 * Compatible with both Flechette and Arrow-JS table instances.
 */
export interface ArrowTable {
  numRows: number;
  numCols: number;
  schema: ArrowSchema;
  getChild(name: string): ArrowColumn<any>;
  getChildAt(index: number): ArrowColumn<any>;
}

/** Options for Apache Arrow import. */
export interface ArrowOptions extends ExtractionOptions {
  /**
   * An ordered set of columns to import. The input may consist of column name
   * strings, column integer indices, objects with current column names as
   * keys and new column names as values (for renaming), or selection helper
   * functions such as *all*, *not*, or *range*.
   */
  columns?: Select;
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

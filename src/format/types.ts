import { ExtractionOptions, TableBuilderOptions } from '@uwdata/flechette';
import type { ColumnType, Select } from '../table/types.js';
import { ColumnSelectOptions } from './util.js';

/** Arrow input data as bytes or loaded table. */
export type ArrowInput =
  | ArrayBuffer
  | Uint8Array
  | ArrowTable;

/** A column in an Apache Arrow table. */
export interface ArrowColumn<T> extends ColumnType<T> {
  type: ArrowDataType;
  nullCount: number;
  toArray(): ColumnType<T>;
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
export interface ArrowFormatOptions extends TableBuilderOptions {
  /**
   * Ordered list of column names to include. If function-valued, the
   * function should accept a dataset as input and return an array of
   * column name strings. If unspecified all columns are included.
   */
  columns?: ColumnSelectOptions;
  /** The maximum number of rows to include (default `Infinity`). */
  limit?: number;
  /**
   * The row offset (default `0`) indicating how many initial rows to skip.
   */
  offset?: number;
}

/** Options for Arrow IPC encoding. */
export interface ArrowIPCFormatOptions extends ArrowFormatOptions {
  /**
   * The Arrow IPC byte format to use. One of `'stream'` (default) or `'file'`.
   */
  format?: 'stream' | 'file';
}

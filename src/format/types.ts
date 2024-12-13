import { ExtractionOptions, TableBuilderOptions } from '@uwdata/flechette';
import type { Table } from '../table/Table.js';
import type { ColumnType, Select } from '../table/types.js';

/**
 * Options for loading data from files or URLs.
 */
export interface LoadOptions {
  /**
   * Options to pass to the HTTP fetch method when loading a URL.
   */
  fetch?: RequestInit;
  /**
   * Decompression format to apply. If unspecified, the decompression type
   * is inferred from the file extension (.gz or .zz). If no matching extension
   * is found, no decompression is performed.
   */
  decompress?: 'gzip' | 'deflate' | null;
}

/**
 * Column format object.
 */
export interface ValueFormatObject {
  /**
   * If true, format dates in UTC time.
   */
  utc?: boolean;
  /**
   * The number of fractional digits to include when formatting numbers.
   */
  digits?: number;
  /**
   * The maximum string length for formatting nested object or array values.
   */
  maxlen?: number;
}

/**
 * Callback function to format an individual value.
 * @param {*} value The value to format.
 * @return {*} A string-coercible or JSON-compatible formatted value.
 */
export type ValueFormatFunction = (value: any) => any;

/**
 * Value format options.
 */
export type ValueFormatOptions = ValueFormatObject | ValueFormatFunction;

/**
 * Column selection function.
 */
export type ColumnSelectFunction = (table: Table) => string[];

/**
 * Column selection options.
 */
export type ColumnSelectOptions = string[] | ColumnSelectFunction;

/**
 * Column format options. The object keys should be column names.
 * The object values should be formatting functions or objects.
 * If specified, these override any automatically inferred options.
 */
export type ColumnFormatOptions = Record<string, ValueFormatOptions>;

/**
 * Column alignment options. The object keys should be column names.
 * The object values should be aligment strings, one of 'l' (left),
 * 'c' (center), or 'r' (right).
 * If specified, these override any automatically inferred options.
 */
export type ColumnAlignOptions = Record<string, 'l'|'c'|'r'>;

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

/** Options for Arrow import. */
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
  /**
   * The maximum number of rows to include (default `Infinity`).
   */
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

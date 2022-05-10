import { defaultColumnFactory } from './column';
import columnsFrom from './columns-from';
import columnSet from './column-set';
import Table from './table';
import { nest, regroup, reindex } from './regroup';
import { rowObjectBuilder } from '../expression/row-object';
import { default as toArrow, toArrowIPC } from '../format/to-arrow';
import toCSV from '../format/to-csv';
import toHTML from '../format/to-html';
import toJSON from '../format/to-json';
import toMarkdown from '../format/to-markdown';
import resolve, { all } from '../helpers/selection';
import arrayType from '../util/array-type';
import entries from '../util/entries';
import error from '../util/error';
import mapObject from '../util/map-object';

/**
 * Class representing a table backed by a named set of columns.
 */
export default class ColumnTable extends Table {

  /**
   * Create a new ColumnTable from existing input data.
   * @param {object[]|Iterable<object>|object|Map} values The backing table data values.
   *  If array-valued, should be a list of JavaScript objects with
   *  key-value properties for each column value.
   *  If object- or Map-valued, a table with two columns (one for keys,
   *  one for values) will be created.
   * @param {string[]} [names] The named columns to include.
   * @return {ColumnTable} A new ColumnTable instance.
   */
  static from(values, names) {
    return new ColumnTable(columnsFrom(values, names), names);
  }

  /**
   * Create a new table for a set of named columns.
   * @param {object|Map} columns
   *  The set of named column arrays. Keys are column names.
   *  The enumeration order of the keys determines the column indices,
   *  unless the names parameter is specified.
   *  Values must be arrays (or array-like values) of identical length.
   * @param {string[]} [names] Ordered list of column names. If specified,
   *  this array determines the column indices. If not specified, the
   *  key enumeration order of the columns object is used.
   * @return {ColumnTable} the instantiated ColumnTable instance.
   */
  static new(columns, names) {
    if (columns instanceof ColumnTable) return columns;
    const data = {};
    const keys = [];
    for (const [key, value] of entries(columns)) {
      data[key] = value;
      keys.push(key);
    }
    return new ColumnTable(data, names || keys);
  }

  /**
   * Instantiate a new ColumnTable instance.
   * @param {object} columns An object mapping column names to values.
   * @param {string[]} [names] An ordered list of column names.
   * @param {BitSet} [filter] A filtering BitSet.
   * @param {GroupBySpec} [group] A groupby specification.
   * @param {RowComparator} [order] A row comparator function.
   * @param {Params} [params] An object mapping parameter names to values.
   */
  constructor(columns, names, filter, group, order, params) {
    mapObject(columns, defaultColumnFactory, columns);
    names = names || Object.keys(columns);
    const nrows = names.length ? columns[names[0]].length : 0;
    super(names, nrows, columns, filter, group, order, params);
  }

  /**
   * Create a new table with the same type as this table.
   * The new table may have different data, filter, grouping, or ordering
   * based on the values of the optional configuration argument. If a
   * setting is not specified, it is inherited from the current table.
   * @param {CreateOptions} [options] Creation options for the new table.
   * @return {ColumnTable} A newly created table.
   */
  create({ data, names, filter, groups, order }) {
    const f = filter !== undefined ? filter : this.mask();

    return new ColumnTable(
      data || this._data,
      names || (!data ? this._names : null),
      f,
      groups !== undefined ? groups : regroup(this._group, filter && f),
      order !== undefined ? order : this._order,
      this._params
    );
  }

  /**
   * Create a new table with additional columns drawn from one or more input
   * tables. All tables must have the same numer of rows and are reified
   * prior to assignment. In the case of repeated column names, input table
   * columns overwrite existing columns.
   * @param {...ColumnTable} tables The tables to merge with this table.
   * @return {ColumnTable} A new table with merged columns.
   * @example table.assign(table1, table2)
   */
  assign(...tables) {
    const nrows = this.numRows();
    const base = this.reify();
    const cset = columnSet(base).groupby(base.groups());
    tables.forEach(input => {
      input = ColumnTable.new(input);
      if (input.numRows() !== nrows) error('Assign row counts do not match');
      input = input.reify();
      input.columnNames(name => cset.add(name, input.column(name)));
    });
    return this.create(cset.new());
  }

  /**
   * Get the backing set of columns for this table.
   * @return {ColumnData} Object of named column instances.
   */
  columns() {
    return this._data;
  }

  /**
   * Get the column instance with the given name.
   * @param {string} name The column name.
   * @return {ColumnType | undefined} The named column, or undefined if it does not exist.
   */
  column(name) {
    return this._data[name];
  }

  /**
   * Get the column instance at the given index position.
   * @param {number} index The zero-based column index.
   * @return {ColumnType | undefined} The column, or undefined if it does not exist.
   */
  columnAt(index) {
    return this._data[this._names[index]];
  }

  /**
   * Get an array of values contained in a column. The resulting array
   * respects any table filter or orderby criteria.
   * @param {string} name The column name.
   * @param {ArrayConstructor|import('./table').TypedArrayConstructor} [constructor=Array]
   *  The array constructor for instantiating the output array.
   * @return {import('./table').DataValue[]|import('./table).TypedArray} The array of column values.
   */
  array(name, constructor = Array) {
    const column = this.column(name);
    const array = new constructor(this.numRows());
    let idx = -1;
    this.scan(row => array[++idx] = column.get(row), true);
    return array;
  }

  /**
   * Get the value for the given column and row.
   * @param {string} name The column name.
   * @param {number} [row=0] The row index, defaults to zero if not specified.
   * @return {import('./table').DataValue} The table value at (column, row).
   */
  get(name, row = 0) {
    const column = this.column(name);
    return this.isFiltered() || this.isOrdered()
      ? column.get(this.indices()[row])
      : column.get(row);
  }

  /**
   * Returns an accessor ("getter") function for a column. The returned
   * function takes a row index as its single argument and returns the
   * corresponding column value.
   * @param {string} name The column name.
   * @return {import('./table').ColumnGetter} The column getter function.
   */
  getter(name) {
    const column = this.column(name);
    const indices = this.isFiltered() || this.isOrdered() ? this.indices() : null;
    return indices ? row => column.get(indices[row])
      : column ? row => column.get(row)
      : error(`Unrecognized column: ${name}`);
  }

  /**
   * Returns an object representing a table row.
   * @param {number} [row=0] The row index, defaults to zero if not specified.
   * @return {object} A row object with named properties for each column.
   */
  object(row = 0) {
    return objectBuilder(this)(row);
  }

  /**
   * Returns an array of objects representing table rows.
   * @param {ObjectsOptions} [options] The options for row object generation.
   * @return {object[]} An array of row objects.
   */
  objects(options = {}) {
    const { grouped, limit, offset } = options;

    // generate array of row objects
    const names = resolve(this, options.columns || all());
    const create = rowObjectBuilder(names);
    const obj = [];
    this.scan(
      (row, data) => obj.push(create(row, data)),
      true, limit, offset
    );

    // produce nested output as requested
    if (grouped && this.isGrouped()) {
      const idx = [];
      this.scan(row => idx.push(row), true, limit, offset);
      return nest(this, idx, obj, grouped);
    }

    return obj;
  }

  /**
   * Returns an iterator over objects representing table rows.
   * @return {Iterator<object>} An iterator over row objects.
   */
  *[Symbol.iterator]() {
    const create = objectBuilder(this);
    const n = this.numRows();
    for (let i = 0; i < n; ++i) {
      yield create(i);
    }
  }

  /**
   * Create a new fully-materialized instance of this table.
   * All filter and orderby settings are removed from the new table.
   * Instead, the backing data itself is filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {ColumnTable} A reified table.
   */
  reify(indices) {
    const nrows = indices ? indices.length : this.numRows();
    const names = this._names;
    let data, groups;

    if (!indices && !this.isOrdered()) {
      if (!this.isFiltered()) {
        return this; // data already reified
      } else if (nrows === this.totalRows()) {
        data = this.data(); // all rows pass filter, skip copy
      }
    }

    if (!data) {
      const scan = indices ? f => indices.forEach(f) : f => this.scan(f, true);
      const ncols = names.length;
      data = {};

      for (let i = 0; i < ncols; ++i) {
        const name = names[i];
        const prev = this.column(name);
        const curr = data[name] = new (arrayType(prev))(nrows);
        let r = -1;
        scan(row => curr[++r] = prev.get(row));
      }

      if (this.isGrouped()) {
        groups = reindex(this.groups(), scan, !!indices, nrows);
      }
    }

    return this.create({ data, names, groups, filter: null, order: null });
  }

  /**
   * Apply a sequence of transformations to this table. The output
   * of each transform is passed as input to the next transform, and
   * the output of the last transform is then returned.
   * @param {...(Transform|Transform[])} transforms Transformation
   *  functions to apply to the table in sequence. Each function should
   *  take a single table as input and return a table as output.
   * @return {ColumnTable} The output of the last transform.
   */
  transform(...transforms) {
    return transforms.flat().reduce((t, f) => f(t), this);
  }

  /**
   * Format this table as an Apache Arrow table.
   * @param {ArrowFormatOptions} [options] The formatting options.
   * @return {import('apache-arrow').Table} An Apache Arrow table.
   */
  toArrow(options) {
    return toArrow(this, options);
  }

  /**
   * Format this table as binary data in the Apache Arrow IPC format.
   * @param {ArrowFormatOptions} [options] The formatting options.
   * @return {Uint8Array} A new Uint8Array of Arrow-encoded binary data.
   */
  toArrowBuffer(options) {
    return toArrowIPC(this, options);
  }

  /**
   * Format this table as a comma-separated values (CSV) string. Other
   * delimiters, such as tabs or pipes ('|'), can be specified using
   * the options argument.
   * @param {CSVFormatOptions} [options] The formatting options.
   * @return {string} A delimited value string.
   */
  toCSV(options) {
    return toCSV(this, options);
  }

  /**
   * Format this table as an HTML table string.
   * @param {HTMLFormatOptions} [options] The formatting options.
   * @return {string} An HTML table string.
   */
  toHTML(options) {
    return toHTML(this, options);
  }

  /**
   * Format this table as a JavaScript Object Notation (JSON) string.
   * @param {JSONFormatOptions} [options] The formatting options.
   * @return {string} A JSON string.
   */
  toJSON(options) {
    return toJSON(this, options);
  }

  /**
   * Format this table as a GitHub-Flavored Markdown table string.
   * @param {MarkdownFormatOptions} [options] The formatting options.
   * @return {string} A GitHub-Flavored Markdown table string.
   */
  toMarkdown(options) {
    return toMarkdown(this, options);
  }
}

function objectBuilder(table) {
  let b = table._builder;

  if (!b) {
    const create = rowObjectBuilder(table.columnNames());
    const data = table.data();
    if (table.isOrdered() || table.isFiltered()) {
      const indices = table.indices();
      b = row => create(indices[row], data);
    } else {
      b = row => create(row, data);
    }
    table._builder = b;
  }

  return b;
}

/**
 * A table transformation.
 * @typedef {(table: ColumnTable) => ColumnTable} Transform
 */

/**
 * Proxy type for BitSet class.
 * @typedef {import('./table').BitSet} BitSet
 */

/**
 * Proxy type for ColumnType interface.
 * @typedef {import('./column').ColumnType} ColumnType
 */

/**
 * A named collection of columns.
 * @typedef {{[key: string]: ColumnType}} ColumnData
 */

/**
 * Proxy type for GroupBySpec.
 * @typedef {import('./table').GroupBySpec} GroupBySpec
 */

/**
 * Proxy type for RowComparator.
 * @typedef {import('./table').RowComparator} RowComparator
 */

/**
 * Proxy type for Params.
 * @typedef {import('./table').Params} Params
 */

/**
 * Options for Arrow formatting.
 * @typedef {import('../arrow/encode').ArrowFormatOptions} ArrowFormatOptions
 */

/**
 * Options for CSV formatting.
 * @typedef {import('../format/to-csv').CSVFormatOptions} CSVFormatOptions
 */

/**
 * Options for HTML formatting.
 * @typedef {import('../format/to-html').HTMLFormatOptions} HTMLFormatOptions
 */

/**
 * Options for JSON formatting.
 * @typedef {import('../format/to-json').JSONFormatOptions} JSONFormatOptions
 */

/**
 * Options for Markdown formatting.
 * @typedef {import('../format/to-markdown').MarkdownFormatOptions} MarkdownFormatOptions
 */
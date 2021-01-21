import { defaultColumnFactory } from './column';
import columnsFrom from './columns-from';
import Table from './table';
import { regroup, reindex } from './regroup';
import toCSV from '../format/to-csv';
import toHTML from '../format/to-html';
import toJSON from '../format/to-json';
import toMarkdown from '../format/to-markdown';
import arrayType from '../util/array-type';
import error from '../util/error';
import mapObject from '../util/map-object';
import rowObjectBuilder from '../util/row-object-builder';

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
    const f = filter
      ? (this._filter ? this._filter.and(filter) : filter)
      : filter !== undefined ? filter : this._filter;

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
   * Get the value for the given column and row.
   * @param {string} name The column name.
   * @param {number} row The row index.
   * @return {import('./table').DataValue} The table value at (column, row).
   */
  get(name, row) {
    return this._data[name].get(row);
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
    return column
      ? row => column.get(row)
      : error(`Unrecognized column: ${name}`);
  }

  /**
   * Returns an array of objects representing table rows.
   * @param {ObjectsOptions} [options] The options for row object generation.
   * @return {object[]} An array of row objects.
   */
  objects(options = {}) {
    const create = rowObjectBuilder(this);
    const tuples = [];
    this.scan(row => {
      tuples.push(create(row));
    }, true, options.limit, options.offset);
    return tuples;
  }

  /**
   * Returns an iterator over objects representing table rows.
   * @return {Iterator<object>} An iterator over row objects.
   */
  *[Symbol.iterator]() {
    const create = rowObjectBuilder(this);
    const n = this.numRows();

    if (this.isOrdered() || this.isFiltered()) {
      const indices = this.indices();
      for (let i = 0; i < n; ++i) {
        yield create(indices[i]);
      }
    } else {
      for (let i = 0; i < n; ++i) {
        yield create(i);
      }
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
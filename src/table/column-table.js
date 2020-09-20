import Column from './column';
import columnsFrom from './columns-from';
import Table from './table';
import { regroup, reindex } from './regroup';
import { numRows } from '../format/util';
import toCSV from '../format/to-csv';
import toHTML from '../format/to-html';
import toJSON from '../format/to-json';
import toMarkdown from '../format/to-markdown';
import arrayType from '../util/array-type';
import error from '../util/error';
import mapObject from '../util/map-object';
import unroll from '../util/unroll';

/**
 * Class representing a table backed by a named set of columns.
 */
export default class ColumnTable extends Table {

  /**
   * Create a new ColumnTable from existing input data.
   * @param {*} values The backing table data values.
   *  If array-valued, should be a list of JavaScript objects with
   *  key-value properties for each column value.
   *  If object- or Map-valued, a table with two columns (one for keys,
   *  one for values) will be created.
   *  If the input adheres to an Apache Arrow table (providing a schema
   *  property with named fields and a getColumn method), the columns
   *  exported by that object will be used directly.
   * @param {string[]} [names] The named columns to include.
   * @return {ColumnTable} A new ColumnTable instance.
   */
  static from(values, names) {
    return new ColumnTable(columnsFrom(values, names));
  }

  constructor(columns, filter, group, order, params) {
    mapObject(columns, Column.from, columns);
    const names = Object.keys(columns);
    const nrows = names.length ? columns[names[0]].length : 0;
    super(names, nrows, columns, filter, group, order, params);
  }

  create({ data, filter, groups, order }) {
    const f = filter
      ? (this._filter ? this._filter.and(filter) : filter)
      : filter !== undefined ? filter : this._filter;

    return new ColumnTable(
      data || this._data,
      f,
      groups !== undefined ? groups : regroup(this._group, filter && f),
      order !== undefined ? order : this._order,
      this._params
    );
  }

  /**
   * Get the backing set of columns for this table.
   * @return {Object} Object of named column instances.
   */
  columns() {
    return this._data;
  }

  /**
   * Get the column instance with the given name.
   * @param {string} name The column name.
   * @return {Column} The named column, or undefined if does not exist.
   */
  column(name) {
    return this._data[name];
  }

  /**
   * Get the column instance at the given index position.
   * @param {number} index The zero-based column index.
   * @return {Column} The column, or undefined if does not exist.
   */
  columnAt(index) {
    return this._data[this._names[index]];
  }

  /**
   * Get the value for the given column and row.
   * @param {string} name The column name.
   * @param {number} row The row index.
   * @return {*} The table value at (column, row).
   */
  get(name, row) {
    return this._data[name].get(row);
  }

  /**
   * Returns an accessor ("getter") function for a column. The returned
   * function takes a row index as its single argument and returns the
   * corresponding column value.
   * @param {string} name The column name.
   * @return {Function} The column getter function.
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
   * @return {Array} An array of row objects.
   */
  objects(options = {}) {
    const limit = numRows(this, options.limit);
    if (limit <= 0) return [];

    const tuples = Array(limit);
    const names = this.columnNames();
    const create = unroll(
      names.map(name => this.column(name)),
      'row',
      '({' + names.map((_, i) => `${JSON.stringify(_)}:_${i}.get(row)`) + '})'
    );

    let r = 0;
    this.scan((row, data, stop) => {
      tuples[r] = create(row);
      if (++r >= limit) stop();
    }, true);

    return tuples;
  }

  /**
   * Create a new fully-materialized instance of this table.
   * All filter and orderby settings are removed from the new table.
   * Instead, the backing data itself is filtered and ordered as needed.
   * @param {number[]} [indices] Ordered row indices to materialize.
   *  If unspecified, all rows passing the table filter are used.
   * @return {Table} A reified table.
   */
  reify(indices) {
    const nrows = indices ? indices.length : this.numRows();
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
      const names = this.columnNames();
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

    return this.create({ data, groups, filter: null, order: null });
  }

  /**
   * Format this table as a comma-separated values (CSV) string. Other
   * delimiters, such as tabs or pipes ('|'), can be specified using
   * the options argument.
   * @param {CSVFormatOptions} options The formatting options.
   * @return {string} A delimited-value format string.
   */
  toCSV(options) {
    return toCSV(this, options);
  }

  /**
   * Format this table as an HTML table string.
   * @param {HTMLOptions} options The formatting options.
   * @return {string} An HTML table string.
   */
  toHTML(options) {
    return toHTML(this, options);
  }

  /**
   * Format this table as a JavaScript Object Notation (JSON) string.
   * @param {JSONFormatOptions} options The formatting options.
   * @return {string} A JSON string.
   */
  toJSON(options) {
    return toJSON(this, options);
  }

  /**
   * Format this table as a GitHub-Flavored Markdown table string.
   * @param {MarkdownOptions} options The formatting options.
   * @return {string} A GitHub-Flavored Markdown table string.
   */
  toMarkdown(options) {
    return toMarkdown(this, options);
  }
}
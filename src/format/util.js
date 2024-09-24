import inferFormat from './infer.js';
import isFunction from '../util/is-function.js';
import identity from '../util/identity.js';

/**
 * Column selection function.
 * @typedef {(table: import('../table/Table.js').Table) => string[]} ColumnSelectFunction
 */

/**
 * Column selection options.
 * @typedef {string[]|ColumnSelectFunction} ColumnSelectOptions
 */

/**
 * Column format options. The object keys should be column names.
 * The object values should be formatting functions or objects.
 * If specified, these override any automatically inferred options.
 * @typedef {Object.<string, import('./value.js').ValueFormatOptions>} ColumnFormatOptions
 */

/**
 * Column alignment options. The object keys should be column names.
 * The object values should be aligment strings, one of 'l' (left),
 * 'c' (center), or 'r' (right).
 * If specified, these override any automatically inferred options.
 * @typedef {Object.<string, 'l'|'c'|'r'>} ColumnAlignOptions
 */

/**
 * Return a potentially filtered list of column names.
 * @param {import('../table/Table.js').Table} table A data table.
 * @param {ColumnSelectOptions} names The column names to select.
 * @returns {string[]} The selected column names.
 */
export function columns(table, names) {
  // @ts-ignore
  return isFunction(names) ? names(table)
    : names || table.columnNames();
}

export function formats(table, names, options) {
  const formatOpt = options.format || {};
  const alignOpt = options.align || {};
  const format = {};
  const align = {};

  names.forEach(name => {
    const auto = inferFormat(values(table, name), options);
    align[name] = alignOpt[name] || auto.align;
    format[name] = formatOpt[name] || auto.format;
  });

  return { align, format };
}

function values(table, columnName) {
  const column = table.column(columnName);
  return fn => table.scan(row => fn(column.at(row)));
}

export function scan(table, names, limit = 100, offset, ctx) {
  const { start = identity, cell, end = identity } = ctx;
  const data = table.data();
  const n = names.length;
  table.scan(row => {
    start(row);
    for (let i = 0; i < n; ++i) {
      const name = names[i];
      cell(data[name].at(row), name, i);
    }
    end(row);
  }, true, limit, offset);
}

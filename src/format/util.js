import Table from '../table/table'; // eslint-disable-line no-unused-vars

import inferFormat from './infer';
import isFunction from '../util/is-function';

/**
 * Column selection function.
 * @typedef {(table: Table) => string[]} ColumnSelectFunction
 */

/**
 * Column selection options.
 * @typedef {string[]|ColumnSelectFunction} ColumnSelectOptions
 */

/**
 * Column format options. The object keys should be column names.
 * The object values should be formatting functions or objects.
 * If specified, these override any automatically inferred options.
 * @typedef {Object.<string, import('./value').ValueFormatOptions} ColumnFormatOptions
 */

/**
 * Column alignment options. The object keys should be column names.
 * The object values should be aligment strings, one of 'l' (left),
 * 'c' (center), or 'r' (right).
 * If specified, these override any automatically inferred options.
 * @typedef {Object.<string, 'l'|'c'|'r'>} ColumnAlignOptions
 */

export function columns(table, names) {
  return isFunction(names)
    ? names(table)
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
  return fn => table.scan(row => fn(column.get(row)));
}

export function scan(table, names, limit = 100, offset, ctx) {
  const data = table.data();
  const n = names.length;
  table.scan(row => {
    ctx.row(row);
    for (let i = 0; i < n; ++i) {
      const name = names[i];
      ctx.cell(data[names[i]].get(row), name, i);
    }
  }, true, limit, offset);
}
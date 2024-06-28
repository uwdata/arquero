import inferFormat from './infer.js';
import isFunction from '../util/is-function.js';

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
  return fn => table.scan(row => fn(column.at(row)));
}

export function scan(table, names, limit = 100, offset, ctx) {
  const data = table.data();
  const n = names.length;
  table.scan(row => {
    ctx.row(row);
    for (let i = 0; i < n; ++i) {
      const name = names[i];
      ctx.cell(data[names[i]].at(row), name, i);
    }
  }, true, limit, offset);
}

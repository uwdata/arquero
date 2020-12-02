import inferFormat from './infer';
import isFunction from '../util/is-function';

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

export function scan(table, names, limit, offset, ctx) {
  const n = names.length;
  table.scan(row => {
    ctx.row(row);
    for (let i = 0; i < n; ++i) {
      const name = names[i];
      ctx.cell(table.get(name, row), name, i);
    }
  }, true, limit, offset);
}
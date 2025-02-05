import { inferFormat } from './infer.js';

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

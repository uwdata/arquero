import { formatUTCDate } from '../util/format-date.js';
import { identity } from '../util/identity.js';
import { isDate } from '../util/is-date.js';
import { COLUMNS, NDJSON } from './stream/constants.js';
import { columns } from './util/columns.js';

/**
 * Options for JSON formatting.
 * @typedef {object} JSONFormatOptions
 * @property {'columns' | 'rows' | 'ndjson' | null} [type] The format type.
 *  One of `'columns'` (for an object with named column arrays)`, 'rows'` (for
 *  an array for row objects), or `'ndjson'` for [newline-delimited JSON][1]
 *  rows. For `'ndjson'`, each line of text will contain a JSON row object
 *  (with no trailing comma) and string properties will be stripped of any
 *  newline characters. If no format type is specified, defaults to `'rows'`.
 *
 *  [1]: https://github.com/ndjson/ndjson-spec
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {number} [offset=0] The row offset indicating how many initial
 *  rows to skip.
 * @property {import('./types.js').ColumnSelectOptions} [columns] Ordered list
 *  of column names to include. If function-valued, the function should
 *  accept a table as input and return an array of column name strings.
 * @property {Object.<string, (value: any) => any>} [format] Object of column
 *  format options. The object keys should be column names. The object values
 *  should be formatting functions to invoke to transform column values prior
 *  to output. If specified, these override automatically inferred options.
 */

const defaultFormatter = value => isDate(value)
  ? formatUTCDate(value, true)
  : value;

/**
 * Format a table as a JavaScript Object Notation (JSON) string.
 * @param {import('../table/Table.js').Table} table The table to format.
 * @param {JSONFormatOptions} options The formatting options.
 * @return {string} A JSON string.
 */
export function toJSON(table, {
  type,
  columns: cols,
  format = {},
  limit,
  offset
} = {}) {
  const names = columns(table, cols);
  const fmt = names.map(name => format[name] || defaultFormatter);
  const scan = fn => table.scan(fn, true, limit, offset);

  return type === COLUMNS
    ? toColumns(table, names, fmt, scan)
    : toRows(table, names, fmt, scan, type === NDJSON);
}

function toColumns(table, names, format, scan) {
  let text = '{';

  names.forEach((name, i) => {
    text += (i ? ',' : '') + JSON.stringify(name) + ':[';

    const column = table.column(name);
    const formatter = format[i];
    let r = -1;
    scan(row => {
      const value = column.at(row);
      text += (++r ? ',' : '') + JSON.stringify(formatter(value));
    });

    text += ']';
  });

  return text + '}';
}

function toRows(table, names, format, scan, nd = false) {
  const n = names.length;
  const keys = names.map(name => `"${name}":`);
  const cols = names.map(name => table.column(name));

  const finish = nd ? o => o.replaceAll('\n', '') : identity;
  const sep = nd ? '\n' : ',';
  let text = nd ? '' : '[';

  let r = -1;
  scan(row => {
    const props = [];
    for (let i = 0; i < n; ++i) {
      props.push(keys[i] + JSON.stringify(format[i](cols[i].at(row))));
    }
    text += (++r ? sep : '') + finish(`{${props.join(',')}}`);
  });

  return text + (nd ? '' : ']');
}

import { columns } from './util/columns.js';
import { formats } from './util/formats.js';
import { formatValue } from './util/format-value.js';
import { scan } from './util/scan.js';

/**
 * Options for Markdown formatting.
 * @typedef {object} MarkdownFormatOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {number} [offset=0] The row offset indicating how many initial
 *  rows to skip.
 * @property {import('./types.js').ColumnSelectOptions} [columns] Ordered list
 *  of column names to include. If function-valued, the function should
 *  accept a table as input and return an array of column name strings.
 * @property {import('./types.js').ColumnAlignOptions} [align] Object of column
 *  alignment options. The object keys should be column names. The object
 *  values should be aligment strings, one of 'l' (left), 'c' (center), or
 *  'r' (right). If specified, these override automatically inferred options.
 * @property {import('./types.js').ColumnFormatOptions} [format] Object of column
 *  format options. The object keys should be column names. The object values
 *  should be formatting functions or specification objects. If specified,
 *  these override automatically inferred options.
 * @property {number} [maxdigits=6] The maximum number of fractional digits
 *  to include when formatting numbers. This option is passed to the format
 *  inference method and is overridden by any explicit format options.
 */

/**
 * Format a table as a GitHub-Flavored Markdown table string.
 * @param {import('../table/Table.js').Table} table The table to format.
 * @param {MarkdownFormatOptions} options The formatting options.
 * @return {string} A GitHub-Flavored Markdown table string.
 */
export function toMarkdown(table, options = {}) {
  const names = columns(table, options.columns);
  const { align, format } = formats(table, names, options);

  const alignValue = a => a === 'c' ? ':-:' : a === 'r' ? '-:' : ':-';
  const escape = s => s.replace(/\|/g, '\\|');

  let text = '|'
    + names.map(escape).join('|')
    + '|\n|'
    + names.map(name => alignValue(align[name])).join('|')
    + '|\n';

  scan(table, names, options.limit, options.offset, {
    start() {
      text += '|';
    },
    cell(value, name) {
      text += escape(formatValue(value, format[name])) + '|';
    },
    end() {
      text += '\n';
    }
  });

  return text;
}

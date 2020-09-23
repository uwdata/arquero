import formatValue from './value';
import { columns, formats, scan } from './util';

/**
 * Options for Markdown formatting.
 * @typedef {Object} MarkdownOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]} [columns] Ordered list of column names to print.
 * @property {Object} [align] Object of column alignment options.
 *  The object keys should be column names. The object values should be
 *  aligment strings, one of 'l' (left), 'c' (center), or 'r' (right).
 *  If specified, these override the automatically inferred options.
 * @property {Object} [format] Object of column format options.
 *  The object keys should be column names. The object values should be
 *  formatting functions or objects with any of the following properties.
 *  If specified, these override the automatically inferred options.
 *  - {string} date One of 'utc' or 'loc' (for UTC or local dates), or null for full date times.
 *  - {number} digits Number of significant digits to include for numbers.
 */

/**
 * Format a table as a GitHub-Flavored Markdown table string.
 * @param {ColumnTable} table The table to format.
 * @param {MarkdownOptions} options The formatting options.
 * @return {string} A GitHub-Flavored Markdown table string.
 */
export default function(table, options = {}) {
  const names = columns(table, options.columns);
  const { align, format } = formats(table, names, options);

  const alignValue = a => a === 'c' ? ':-:' : a === 'r' ? '-:' : ':-';
  const escape = s => s.replace(/\|/g, '\\|');

  let text = '|'
    + names.map(escape).join('|')
    + '|\n|'
    + names.map(name => alignValue(align[name])).join('|')
    + '|';

  scan(table, names, options.limit, {
    row() {
      text += '\n|';
    },
    cell(value, name) {
      text += escape(formatValue(value, format[name])) + '|';
    }
  });

  return text + '\n';
}
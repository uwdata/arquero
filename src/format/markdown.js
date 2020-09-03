import formatValue from './value';
import { columns, formats, scan } from './util';

/**
 * Options for Markdown formatting.
 * @typedef {Object} MarkdownOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]} [columns] Ordered list of column names to print.
 * @property {Object} [format] Object of column format options.
 *  The object keys should be column names. The object values should be
 *  objects with any of the following properties. If specified, these
 *  override the automatically inferred options.
 *  - {string} align One of 'l' (left), 'c' (center), or 'r' (right).
 *  - {string} date One of 'utc' or 'loc' (for UTC or local dates), or null for full date times.
 *  - {number} digits Number of significant digits to include for numbers.
 */

/**
 * Format a table as a Github-Flavored Markdown table string.
 * @param {ColumnTable} table The table to format.
 * @param {MarkdownOptions} options The formatting options.
 * @return {string} A Github-Flavored Markdown table string.
 */
export default function(table, options = {}) {
  const names = columns(table, options.columns);
  const format = formats(table, names, options);

  const align = a => a === 'c' ? ':-:' : a === 'r' ? '-:' : ':-';
  const escape = s => s.replace(/\|/g, '\\|');

  let text = '|'
    + names.map(escape).join('|')
    + '|\n|'
    + names.map(name => align(format[name].align)).join('|')
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
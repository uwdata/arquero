import formatValue from './value';
import { columns, formats, scan } from './util';

/**
 * Options for HTML formatting.
 * @typedef {Object} HTMLOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]} [columns] Ordered list of column names to print.
 * @property {Object} [format] Object of column format options.
 *  The object keys should be column names. The object values should be
 *  objects with any of the following properties. If specified, these
 *  override the automatically inferred options.
 *  - {string} align One of 'l' (left), 'c' (center), or 'r' (right).
 *  - {string} date One of 'utc' or 'loc' (for UTC or local dates), or null for full date times.
 *  - {number} digits Number of significant digits to include for numbers.
 * @property {Object} [style] CSS styles to include in HTML output.
 *  The object keys should be HTML table tag names: 'table', 'thead',
 *  'tbody', 'tr', 'th', or 'td'. The object values should be strings of
 *  valid CSS style directives (such as "font-weight: bold;").
 */

/**
 * Format a table as an HTML table string.
 * @param {ColumnTable} table The table to format.
 * @param {HTMLOptions} options The formatting options.
 * @return {string} An HTML table string.
 */
export default function(table, options = {}) {
  const names = columns(table, options.columns);
  const format = formats(table, names, options);
  const styles = options.style || {};

  const align = a => a === 'c' ? 'center' : a === 'r' ? 'right' : 'left';
  const escape = s => s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const tag = (tag, name) => {
    const a = name ? align(format[name].align) : '';
    const s = (a ? `text-align: ${a};` : '') + (styles[tag] || '');
    return `<${tag}${s ? ` style="${s}"`: ''}>`;
  };

  let text = tag('table')
    + tag('thead')
    + tag('tr')
    + names.map(name => `${tag('th')}${name}</th>`).join('')
    + '</tr></thead>'
    + tag('tbody');

  let row = -1;

  scan(table, names, options.limit, {
    row() {
      text += (++row ? '</tr>' : '') + tag('tr');
    },
    cell(value, name) {
      text += tag('td', name)
        + escape(formatValue(value, format[name]))
        + '</td>';
    }
  });

  return text + '</tr></tbody></table>';
}
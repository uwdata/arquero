import formatValue from './value';
import { columns, formats, scan } from './util';
import isFunction from '../util/is-function';
import mapObject from '../util/map-object';

/**
 * Options for HTML formatting.
 * @typedef {object} HTMLOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {number} [offset=0] The row offset indicating how many initial rows to skip.
 * @property {string[]} [columns] Ordered list of column names to print.
 * @property {object} [align] Object of column alignment options.
 *  The object keys should be column names. The object values should be
 *  aligment strings, one of 'l' (left), 'c' (center), or 'r' (right).
 *  If specified, these override the automatically inferred options.
 * @property {object} [format] Object of column format options.
 *  The object keys should be column names. The object values should be
 *  formatting functions or objects with any of the following properties.
 *  If specified, these override the automatically inferred options.
 *  - {string} date One of 'utc' or 'loc' (for UTC or local dates), or null for full date times.
 *  - {number} digits Number of significant digits to include for numbers.
 * @property {Function} [null] Format function for null and undefined values.
 *  If specified, this function will be invoked with the null or undefined
 *  value as the sole input, and the return value will be used as the HTML
 *  output for the value.
 * @property {object} [style] CSS styles to include in HTML output.
 *  The object keys should be HTML table tag names: 'table', 'thead',
 *  'tbody', 'tr', 'th', or 'td'. The object values should be strings of
 *  valid CSS style directives (such as "font-weight: bold;") or functions
 *  that take a column name and row as inputs and return a CSS string.
 */

/**
 * Format a table as an HTML table string.
 * @param {ColumnTable} table The table to format.
 * @param {HTMLOptions} options The formatting options.
 * @return {string} An HTML table string.
 */
export default function(table, options = {}) {
  const names = columns(table, options.columns);
  const { align, format } = formats(table, names, options);
  const style = styles(options);
  const nullish = options.null;

  const alignValue = a => a === 'c' ? 'center' : a === 'r' ? 'right' : 'left';
  const escape = s => s.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const baseFormat = (value, opt) => escape(formatValue(value, opt));
  const formatter = nullish
    ? (value, opt) => value == null ? nullish(value) : baseFormat(value, opt)
    : baseFormat;

  let r = -1;
  let idx = -1;

  const tag = (tag, name) => {
    const a = idx >= 0 && name ? alignValue(align[name]) : '';
    const s = style[tag] ? (style[tag](name, idx, r) || '') : '';
    const css = (a ? (`text-align: ${a};` + (s ? ' ' : '')) : '') + s;
    return `<${tag}${css ? ` style="${css}"` : ''}>`;
  };

  let text = tag('table')
    + tag('thead')
    + tag('tr', r)
    + names.map(name => `${tag('th', name)}${name}</th>`).join('')
    + '</tr></thead>'
    + tag('tbody');

  scan(table, names, options.limit, options.offset, {
    row(row) {
      r = row;
      text += (++idx ? '</tr>' : '') + tag('tr');
    },
    cell(value, name) {
      text += tag('td', name)
        + formatter(value, format[name])
        + '</td>';
    }
  });

  return text + '</tr></tbody></table>';
}

function styles(options) {
  return mapObject(
    options.style,
    value => isFunction(value) ? value : () => value
  );
}
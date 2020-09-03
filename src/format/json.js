import ColumnTable from '../table/column-table';
import { columns, numRows } from './util';

/**
 * Options for JSON formatting.
 * @typedef {Object} JSONFormatOptions
 * @property {number} [limit=Infinity] The maximum number of rows to print.
 * @property {string[]|Function} [columns] Ordered list of column names
 *  to include. If function-valued, the function should accept a table as
 *  input and return an array of column name strings.
 */

/**
 * Format a table as a JavaScript Object Notation (JSON) string.
 * @param {ColumnTable} table The table to format.
 * @param {JSONFormatOptions} options The formatting options.
 * @return {string} A string in a delimited-value format.
 */
export function toJSON(table, options = {}) {
  const limit = numRows(table, options.limit);
  const names = columns(table, options.columns);
  let text = '{';

  names.forEach((name, i) => {
    text += (i ? ',' : '') + JSON.stringify(name) + ':[';

    const column = table.column(name);
    if (limit > 0) {
      let r = 0;
      table.scan((row, data, stop) => {
        text += (r ? ',' : '') + JSON.stringify(column.get(row));
        if (++r >= limit) stop();
      });
    }

    text += ']';
  });

  return text + '}';
}

/**
 * Parse JavaScript Object Notation (JSON) data into a table. The expected
 * JSON format is an object with column names for keys and column value
 * arrays for values. String values that match the ISO standard date format
 * are parsed into JavaScript Date objects.
 * @param {string|Object} data A string in a JSON format, or a
 *  a corresponding Object instance.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export function fromJSON(data) {
  if (typeof data === 'string') data = JSON.parse(data, valueParse);
  return new ColumnTable(data);
}

const fixtz = new Date('2019-01-01T00:00').getHours()
           || new Date('2019-07-01T00:00').getHours();

function valueParse(key, value) {
  if (typeof value === 'string') {
    let m;
    if (m = value.match(/^([-+]\d{2})?\d{4}(-\d{2}(-\d{2})?)?(T\d{2}:\d{2}(:\d{2}(\.\d{3})?)?(Z|[-+]\d{2}:\d{2})?)?$/)) {
      if (fixtz && !!m[4] && !m[7]) value = value.replace(/-/g, '/').replace(/T/, ' ');
      value = new Date(value);
    }
  }
  return value;
}
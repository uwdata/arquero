import ColumnTable from '../table/column-table';

/**
 * Parse JavaScript Object Notation (JSON) data into a table. The expected
 * JSON format is an object with column names for keys and column value
 * arrays for values. String values that match the ISO standard date format
 * are parsed into JavaScript Date objects.
 * @param {string|Object} data A string in a JSON format, or a
 *  corresponding Object instance.
 * @param {ColumnTable} table A new table containing the parsed values.
 */
export default function(data) {
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
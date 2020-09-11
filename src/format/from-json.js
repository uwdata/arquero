import ColumnTable from '../table/column-table';
import parseIsoDate from '../util/parse-iso-date';

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
  if (typeof data === 'string') {
    data = JSON.parse(data, (key, value) => typeof value === 'string'
      ? parseIsoDate(value, d => new Date(d))
      : value);
  }
  return new ColumnTable(data);
}
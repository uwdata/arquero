import error from '../util/error';
import isString from '../util/is-string';

export default function(table, columns) {
  const data = {};

  for (const curr in columns) {
    const value = columns[curr];
    const next = isString(value) ? value : curr;
    if (next) {
      data[next] = table.column(curr) || error(`Unrecognized column: ${curr}`);
    }
  }

  return table.create({ data });
}
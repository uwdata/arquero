import error from '../util/error';
import isString from '../util/is-string';

export default function(table, columns) {
  const data = {};
  const used = new Set();

  for (const key in columns) {
    const value = columns[key];
    const name = isString(value) ? value : (value ? key : null);
    if (name != null && !used.has(name)) {
      const col = table.column(name);
      col
        ? data[key] = col
        : error(`Unrecognized column: ${name}`);
      used.add(name);
    }
  }

  return table.create({ data });
}
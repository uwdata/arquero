import ColumnTable from './column-table';
import { autoType, dsvFormat } from 'd3-dsv';

export function csvParse(text, options = {}) {
  const delim = options.delim || ',';
  const dsv = dsvFormat(delim);
  const values = [];
  let names = [];

  dsv.parseRows(text, (row, index) => {
    if (index === 0) {
      names = row;
      const n = names.length;
      for (let i = 0; i < n; ++i) {
        values[i] = [];
      }
    } else {
      const n = names.length;
      autoType(row);
      for (let i = 0; i < n; ++i) {
        values[i].push(row[i]);
      }
    }
  });

  const columns = {};
  names.forEach((name, i) => columns[name] = values[i]);
  return new ColumnTable(columns);
}

export function csvFormat(table, options = {}) {
  const delim = options.delim || ',';
  const dsv = dsvFormat(delim);
  const names = table.columnNames();

  const lines = Array(table.numRows() + 1);
  let line = 0;
  lines[line] = names.map(dsv.formatValue).join(delim);

  table.scan((row, data) => {
    lines[++line] = names
      .map(name => dsv.formatValue(data[name].get(row)))
      .join(delim);
  });

  return lines.join('\n');
}
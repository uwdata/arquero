import ColumnTable from './column-table';

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

export function jsonFormat(table) {
  let text = '{';

  table.columnNames().forEach((name, i) => {
    const column = table.column(name);
    let j = -1;
    text += (i ? ',' : '') + JSON.stringify(name) + ':[';
    table.scan(row => {
      text += (++j ? ',' : '') + JSON.stringify(column.get(row));
    });
    text += ']';
  });

  return text + '}';
}

export function jsonParse(data) {
  if (typeof data === 'string') data = JSON.parse(data, valueParse);
  return new ColumnTable(data);
}
import isArray from '../src/util/is-array';
import isObject from '../src/util/is-object';
import isTypedArray from '../src/util/is-typed-array';

export default function(t, table, data, message) {
  table = table.reify();
  const tableData = {};
  for (const name of table.columnNames()) {
    const column = table.column(name);
    tableData[name] = Array.isArray(column.data)
      ? column.data
      : Array.from(column, arrayMap);
  }
  t.deepEqual(tableData, data, message);
}

function arrayMap(value) {
  return isTypedArray(value) ? Array.from(value)
    : isObject(value) && !isArray(value) ? objectMap(value)
    : value;
}

function objectMap(value) {
  const obj = {};
  for (const name in value) {
    obj[name] = arrayMap(value[name]);
  }
  return obj;
}
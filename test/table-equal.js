import isArray from '../src/util/is-array';
import isDate from '../src/util/is-date';
import isObject from '../src/util/is-object';
import isRegExp from '../src/util/is-regexp';
import isTypedArray from '../src/util/is-typed-array';

export default function(t, table, data, message) {
  table = table.reify();
  const tableData = {};
  for (const name of table.columnNames()) {
    tableData[name] = Array.from(table.column(name), arrayMap);
  }
  t.deepEqual(tableData, data, message);
}

function arrayMap(value) {
  return isTypedArray(value) ? Array.from(value)
    : isArray(value) ? value.map(arrayMap)
    : isObject(value) && !isDate(value) && !isRegExp(value) ? objectMap(value)
    : value;
}

function objectMap(value) {
  const obj = {};
  for (const name in value) {
    obj[name] = arrayMap(value[name]);
  }
  return obj;
}
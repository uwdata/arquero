import error from '../util/error';
import isArray from '../util/is-array';
import isDate from '../util/is-date';
import isFunction from '../util/is-function';
import isObject from '../util/is-object';
import isRegExp from '../util/is-regexp';
import isString from '../util/is-string';

export default function(values, names) {
  const raise = type => error(`Illegal argument type: ${type || typeof values}`);
  const iter = Symbol.iterator;
  return values instanceof Map ? fromKeyValuePairs(values.entries(), names)
    : isDate(values) ? raise('Date')
    : isRegExp(values) ? raise('RegExp')
    : isString(values) ? raise()
    : isArrow(values) ? fromArrow(values, names)
    : isFunction(values[iter]) ? fromValues(values[iter](), names)
    : isObject(values) ? fromKeyValuePairs(Object.entries(values), names)
    : raise();
}

function isArrow(value) {
  return value
    && value.schema && isArray(value.schema.fields)
    && isFunction(value.getColumn);
}

function fromArrow(table, names) {
  const columns = {};
  names = names || table.schema.fields.map(f => f.name);
  names.forEach(name => columns[name] = table.getColumn(name));
  return columns;
}

function fromKeyValuePairs(entries, names = ['key', 'value']) {
  const keys = [];
  const vals = [];

  for (const [key, val] of entries) {
    keys.push(key);
    vals.push(val);
  }

  const columns = {};
  if (names[0]) columns[names[0]] = keys;
  if (names[1]) columns[names[1]] = vals;
  return columns;
}

function fromValues(values, names) {
  const columns = {};
  const addCol = name => columns[name] = [];

  let first = values.next();
  for (; first.value == null && !first.done; first = values.next());

  if (!first.done) {
    names = names || Object.keys(first.value);
    const cols = names.map(addCol);
    const n = cols.length;

    const addRow = obj => {
      for (let i = 0; i < n; ++i) {
        cols[i].push(obj[names[i]]);
      }
    };

    addRow(first.value);
    for (const row of values) {
      if (row != null) addRow(row);
    }
  } else if (names) {
    names.forEach(addCol);
  }

  return columns;
}
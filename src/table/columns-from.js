import error from '../util/error';
import isArray from '../util/is-array';
import isDate from '../util/is-date';
import isFunction from '../util/is-function';
import isObject from '../util/is-object';
import isRegExp from '../util/is-regexp';
import isString from '../util/is-string';

export default function(values, names) {
  const raise = type => error(`Illegal argument type: ${type || typeof values}`);
  return values instanceof Map ? fromKeyValuePairs(values.entries(), names)
    : isDate(values) ? raise('Date')
    : isRegExp(values) ? raise('RegExp')
    : isString(values) ? raise()
    : isArray(values) ? fromArray(values, names)
    : isFunction(values[Symbol.iterator]) ? fromIterable(values, names)
    : isObject(values) ? fromKeyValuePairs(Object.entries(values), names)
    : raise();
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

function fromArray(values, names) {
  const len = values.length;
  const columns = {};
  const add = name => columns[name] = Array(len);

  if (len) {
    names = names || Object.keys(values[0]);
    const cols = names.map(add);
    const n = cols.length;
    for (let idx = 0; idx < len; ++idx) {
      const row = values[idx];
      for (let i = 0; i < n; ++i) {
        cols[i][idx] = row[names[i]];
      }
    }
  } else if (names) {
    names.forEach(add);
  }

  return columns;
}

function fromIterable(values, names) {
  const columns = {};
  const add = name => columns[name] = [];

  let cols;
  let n;
  for (const row of values) {
    if (!cols) {
      names = names || Object.keys(row);
      cols = names.map(add);
      n = cols.length;
    }
    for (let i = 0; i < n; ++i) {
      cols[i].push(row[names[i]]);
    }
  }

  if (!cols && names) {
    names.forEach(add);
  }

  return columns;
}
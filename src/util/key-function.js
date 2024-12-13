import { isArray } from './is-array.js';
import { isDate } from './is-date.js';
import { isRegExp } from './is-regexp.js';
import { isTypedArray } from './is-typed-array.js';

export function key(value) {
  const type = typeof value;
  return type === 'string' ? `"${value}"`
    : type !== 'object' || !value ? value
    : isDate(value) ? +value
    : isArray(value) || isTypedArray(value) ? `[${value.map(key)}]`
    : isRegExp(value) ? value + ''
    : objectKey(value);
}

function objectKey(value) {
  let s = '{';
  let i = -1;
  for (const k in value) {
    if (++i > 0) s += ',';
    s += `"${k}":${key(value[k])}`;
  }
  s += '}';
  return s;
}

export function keyFunction(get, nulls) {
  const n = get.length;
  return n === 1
    ? (row, data) => key(get[0](row, data))
    : (row, data) => {
        let s = '';
        for (let i = 0; i < n; ++i) {
          if (i > 0) s += '|';
          const v = get[i](row, data);
          if (nulls && (v == null || v !== v)) return null;
          s += key(v);
        }
        return s;
      };
}

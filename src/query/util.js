import desc from '../helpers/desc.js';
import field from '../helpers/field.js';
import rolling from '../helpers/rolling.js';
import { all, matches, not, range } from '../helpers/selection.js';
import Query from './query.js';
import error from '../util/error.js';
import isArray from '../util/is-array.js';
import isFunction from '../util/is-function.js';
import isNumber from '../util/is-number.js';
import isObject from '../util/is-object.js';
import isString from '../util/is-string.js';
import map from '../util/map-object.js';
import toArray from '../util/to-array.js';

function func(expr) {
  const f = d => d;
  f.toString = () => expr;
  return f;
}

export function getTable(catalog, ref) {
  ref = ref && isFunction(ref.query) ? ref.query() : ref;
  return ref && isFunction(ref.evaluate)
    ? ref.evaluate(null, catalog)
    : catalog(ref);
}

export function isSelection(value) {
  return isObject(value) && (
    isArray(value.all) ||
    isArray(value.matches) ||
    isArray(value.not) ||
    isArray(value.range)
  );
}

export function toObject(value) {
  return value && isFunction(value.toObject) ? value.toObject()
    : isFunction(value) ? { expr: String(value), func: true }
    : isArray(value) ? value.map(toObject)
    : isObject(value) ? map(value, _ => toObject(_))
    : value;
}

export function fromObject(value) {
  return isArray(value) ? value.map(fromObject)
    : !isObject(value) ? value
    : isArray(value.verbs) ? Query.from(value)
    : isArray(value.all) ? all()
    : isArray(value.range) ? range(...value.range)
    : isArray(value.match) ? matches(RegExp(...value.match))
    : isArray(value.not) ? not(value.not.map(toObject))
    : fromExprObject(value);
}

function fromExprObject(value) {
  let output = value;
  let expr = value.expr;

  if (expr != null) {
    if (value.field === true) {
      output = expr = field(expr);
    } else if (value.func === true) {
      output = expr = func(expr);
    }

    if (isObject(value.window)) {
      const { frame, peers } = value.window;
      output = expr = rolling(expr, frame, peers);
    }

    if (value.desc === true) {
      output = desc(expr);
    }
  }

  return value === output
    ? map(value, _ => fromObject(_))
    : output;
}

export function joinKeys(keys) {
  return isArray(keys) ? keys.map(parseJoinKeys)
    : keys;
}

function parseJoinKeys(keys) {
  const list = [];

  toArray(keys).forEach(param => {
    isNumber(param) ? list.push(param)
      : isString(param) ? list.push(field(param, null))
      : isObject(param) && param.expr ? list.push(param)
      : isFunction(param) ? list.push(param)
      : error(`Invalid key value: ${param+''}`);
  });

  return list;
}

export function joinValues(values) {
  return isArray(values)
    ? values.map(parseJoinValues)
    : values;
}

function parseJoinValues(values, index) {
  return index < 2 ? toArray(values) : values;
}

export function orderbyKeys(keys) {
  const list = [];

  keys.forEach(param => {
    const expr = param.expr != null ? param.expr : param;
    if (isObject(expr) && !isFunction(expr)) {
      for (const key in expr) {
        list.push(expr[key]);
      }
    } else {
      param = isNumber(expr) ? expr
        : isString(expr) ? field(param)
        : isFunction(expr) ? param
        : error(`Invalid orderby field: ${param+''}`);
      list.push(param);
    }
  });

  return list;
}

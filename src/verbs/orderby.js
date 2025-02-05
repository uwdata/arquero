import { compare } from '../expression/compare.js';
import { field } from '../helpers/field.js';
import { error } from '../util/error.js';
import { isFunction } from '../util/is-function.js';
import { isObject } from '../util/is-object.js';
import { isNumber } from '../util/is-number.js';
import { isString } from '../util/is-string.js';

export function orderby(table, ...values) {
  return _orderby(table, parseValues(table, values.flat()));
}

function parseValues(table, params) {
  let index = -1;
  const exprs = new Map();
  const add = val => exprs.set(++index + '', val);

  params.forEach(param => {
    const expr = param.expr != null ? param.expr : param;

    if (isObject(expr) && !isFunction(expr)) {
      for (const key in expr) add(expr[key]);
    } else {
      add(
        isNumber(expr) ? field(param, table.columnName(expr))
          : isString(expr) ? field(param)
          : isFunction(expr) ? param
          : error(`Invalid orderby field: ${param+''}`)
      );
    }
  });

  return compare(table, exprs);
}

export function _orderby(table, comparator) {
  return table.create({ order: comparator });
}

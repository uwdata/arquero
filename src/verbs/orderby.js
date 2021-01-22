import _orderby from '../engine/orderby';
import parse from '../expression/compare';
import field from '../helpers/field';
import error from '../util/error';
import isFunction from '../util/is-function';
import isObject from '../util/is-object';
import isNumber from '../util/is-number';
import isString from '../util/is-string';

export default function(table, values) {
  return _orderby(table, parseValues(table, values));
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

  return parse(table, exprs);
}
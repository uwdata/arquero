import _orderby from '../engine/orderby';
import field from './expr/field';
import parse from '../expression/compare';
import error from '../util/error';
import isFunction from '../util/is-function';
import isObject from '../util/is-object';
import isNumber from '../util/is-number';
import isString from '../util/is-string';

export default function(table, values) {
  return _orderby(table, parseValues(table, values));
}

function parseValues(table, params) {
  const exprs = {};

  let index = -1;
  params.forEach(param => {
    const expr = param.expr != null ? param.expr : param;

    if (isObject(expr) && !isFunction(expr)) {
      for (const key in expr) {
        exprs[++index] = expr[key];
      }
    } else {
      param = isNumber(expr) ? field(param, table.columnName(expr))
        : isString(expr) ? field(param)
        : isFunction(expr) ? param
        : error(`Invalid orderby field: ${param+''}`);
      exprs[++index] = param;
    }
  });

  return parse(table, exprs);
}
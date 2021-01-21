import parse from '../../expression/parse';
import field from '../../helpers/field';
import resolve from '../../helpers/selection';
import assign from '../../util/assign';
import error from '../../util/error';
import isNumber from '../../util/is-number';
import isObject from '../../util/is-object';
import isString from '../../util/is-string';
import isFunction from '../../util/is-function';
import toArray from '../../util/to-array';

export default function(name, table, params, options = { window: false }) {
  const exprs = new Map();

  const marshal = param => {
    param = isNumber(param) ? table.columnName(param) : param;
    isString(param) ? exprs.set(param, field(param))
      : isFunction(param) ? resolve(table, param).forEach(marshal)
      : isObject(param) ? assign(exprs, param)
      : error(`Invalid ${name} value: ${param+''}`);
  };

  toArray(params).forEach(marshal);

  if (options.preparse) {
    options.preparse(exprs);
  }

  return parse(exprs, { table, ...options });
}
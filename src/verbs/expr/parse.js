import field from './field';
import resolve from './selection';
import parse from '../../expression/parse';
import error from '../../util/error';
import isNumber from '../../util/is-number';
import isObject from '../../util/is-object';
import isString from '../../util/is-string';
import isFunction from '../../util/is-function';
import toArray from '../../util/to-array';

export default function(name, table, params, options = { window: false }) {
  const exprs = {};

  const marshal = param => {
    param = isNumber(param) ? table.columnName(param) : param;
    isString(param) ? (exprs[param] = field(param))
      : isFunction(param) ? Object.keys(resolve(table, param)).forEach(marshal)
      : isObject(param) ? Object.assign(exprs, param)
      : error(`Invalid ${name} value: ${param+''}`);
  };

  toArray(params).forEach(marshal);

  if (options.preparse) {
    options.preparse(exprs);
  }

  return parse(exprs, options);
}
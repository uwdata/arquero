import field from './field';
import parse from '../../expression/parse';
import error from '../../util/error';
import isFunction from '../../util/is-function';
import isNumber from '../../util/is-number';
import isString from '../../util/is-string';
import keyFunction from '../../util/key-function';
import toArray from '../../util/to-array';

export default function(name, table, params) {
  const exprs = {};

  toArray(params).forEach((param, i) => {
    param = isNumber(param) ? table.columnName(param) : param;
    isString(param) ? (exprs[i] = field(param))
      : isFunction(param) ? (exprs[i] = param)
      : error(`Invalid ${name} key value: ${param+''}`);
  });

  const fn = parse(exprs, { table, aggregate: false, window: false });
  return keyFunction(Object.values(fn.values), true);
}
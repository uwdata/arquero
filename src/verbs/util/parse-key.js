import parse from '../../expression/parse';
import field from '../../helpers/field';
import error from '../../util/error';
import isFunction from '../../util/is-function';
import isNumber from '../../util/is-number';
import isObject from '../../util/is-object';
import isString from '../../util/is-string';
import keyFunction from '../../util/key-function';
import toArray from '../../util/to-array';

export default function(name, table, params) {
  const exprs = new Map();

  toArray(params).forEach((param, i) => {
    param = isNumber(param) ? table.columnName(param) : param;
    isString(param) ? exprs.set(i, field(param))
      : isFunction(param) || isObject(param) && param.expr ? exprs.set(i, param)
      : error(`Invalid ${name} key value: ${param+''}`);
  });

  const fn = parse(exprs, { table, aggregate: false, window: false });
  return keyFunction(fn.exprs, true);
}
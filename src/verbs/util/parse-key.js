import { parse } from '../../expression/parse.js';
import { field } from '../../helpers/field.js';
import { error } from '../../util/error.js';
import { isFunction } from '../../util/is-function.js';
import { isNumber } from '../../util/is-number.js';
import { isObject } from '../../util/is-object.js';
import { isString } from '../../util/is-string.js';
import { keyFunction } from '../../util/key-function.js';
import { toArray } from '../../util/to-array.js';

export function parseKey(name, table, params) {
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

import { parse } from '../../expression/parse.js';
import { field } from '../../helpers/field.js';
import { resolve } from '../../helpers/selection.js';
import { assign } from '../../util/assign.js';
import { error } from '../../util/error.js';
import { isNumber } from '../../util/is-number.js';
import { isObject } from '../../util/is-object.js';
import { isString } from '../../util/is-string.js';
import { isFunction } from '../../util/is-function.js';
import { toArray } from '../../util/to-array.js';

export function parseValue(name, table, params, options = { window: false }) {
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

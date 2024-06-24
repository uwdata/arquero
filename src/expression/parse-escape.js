import compile from './compile.js';
import { rowObjectCode } from './row-object.js';
import error from '../util/error.js';
import toFunction from '../util/to-function.js';

const ERROR_ESC_AGGRONLY = 'Escaped functions are not valid as rollup or pivot values.';

export default function(ctx, spec, params) {
  if (ctx.aggronly) error(ERROR_ESC_AGGRONLY);

  // generate escaped function invocation code
  const code = '(row,data)=>fn('
    + rowObjectCode(ctx.table.columnNames())
    + ',$)';

  return { escape: compile.escape(code, toFunction(spec.expr), params) };
}

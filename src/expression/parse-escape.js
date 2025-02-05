import { compile } from './compile.js';
import { rowObjectCode } from './row-object.js';
import { error } from '../util/error.js';
import { toFunction } from '../util/to-function.js';

const ERROR_ESC_AGGRONLY = 'Escaped functions are not valid as rollup or pivot values.';

export function parseEscape(ctx, spec, params) {
  if (ctx.aggronly) error(ERROR_ESC_AGGRONLY);

  // generate escaped function invocation code
  const code = `(row,data)=>fn(${rowObjectCode(ctx.table)},$)`;

  return { escape: compile.escape(code, toFunction(spec.expr), params) };
}

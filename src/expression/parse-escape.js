import compile from './compile';
import concat from '../util/concat';
import toString from '../util/to-string';

export default function(ctx, spec, params) {
  // TODO: support additional argument to select columns?
  const cols = ctx.table.columnNames();

  // generate escaped function invocation code
  // TODO move row object generation to utility
  const code = '(row,data)=>fn('
    + '{' + concat(cols, x => `${toString(x)}:data[${toString(x)}].get(row)`, ',') + '}'
    + ',$)';

  return { expr: compile.escape(code, spec.expr, params) };
}
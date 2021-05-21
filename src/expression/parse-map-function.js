import compile from './compile';
import toString from '../util/to-string';
import resolve from '../helpers/selection';

export default function(ctx, spec) {
  // resolve input columns to map function
  const sel = resolve(ctx.table, spec.columns);

  // generate map function invocation code
  const code = '$('
    + Array.from(sel.keys(), x => `data[${toString(x)}].get(row)`)
    + ')';

  return { expr: compile.expr(code, spec.expr) };
}
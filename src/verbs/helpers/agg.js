import { rollup } from '../rollup.js';
import { ungroup } from '../ungroup.js';

/**
 * Convenience function for computing a single aggregate value for
 * a table. Equivalent to ungrouping a table, applying a rollup verb
 * for a single aggregate, and extracting the resulting value.
 * @param {import('../../table/Table.js').Table} table A table instance.
 * @param {import('../../table/types.js').TableExpr} expr An
 *   aggregate table expression to evaluate.
 * @return {import('../../table/types.js').DataValue} The aggregate value.
 * @example agg(table, op.max('colA'))
 * @example agg(table, d => [op.min('colA'), op.max('colA')])
 */
export function agg(table, expr) {
  return rollup(ungroup(table), { _: expr }).get('_');
}

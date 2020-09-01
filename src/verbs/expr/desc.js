import wrap from './wrap';

/**
 * Annotate an expression to indicate descending sort order.
 * @param {fieldRef} expr The field expression to annotate.
 * @return {Object} A wrapped expression indicating descending sort.
 * @example desc('colA')
 * @example desc(d => d.colA)
 */
export default function(expr) {
  return wrap(expr, { desc: true });
}
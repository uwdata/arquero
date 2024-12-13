import { wrap } from './wrap.js';

/**
 * Annotate a table expression to indicate descending sort order.
 * @param {string|Function|object} expr The table expression to annotate.
 * @return {object} A wrapped expression indicating descending sort.
 * @example desc('colA')
 * @example desc(d => d.colA)
 */
export function desc(expr) {
  return wrap(expr, { desc: true });
}

import { isFunction } from '../util/is-function.js';
import { wrap } from './wrap.js';

/**
 * Annotate a table expression with collation metadata, indicating how
 * expression values should be compared and sorted. The orderby verb uses
 * collation metadata to determine sort order. The collation information can
 * either take the form a standard two-argument comparator function, or as
 * locale and option arguments compatible with `Intl.Collator`.
 * @param {string|Function|object} expr The table expression to annotate
 *  with collation metadata.
 * @param {Intl.LocalesArgument | ((a: any, b: any) => number)} comparator
 *  A comparator function or the locale(s) to collate by.
 * @param {Intl.CollatorOptions} [options] Collation options, applicable
 *  with locales only.
 * @return {object} A wrapper object representing the collated value.
 * @example orderby(collate('colA', 'de'))
 */
export function collate(expr, comparator, options) {
  return wrap(expr, {
    collate: isFunction(comparator)
      ? comparator
      : new Intl.Collator(comparator, options).compare
  });
}

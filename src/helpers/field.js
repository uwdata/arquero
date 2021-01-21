import wrap from './wrap';

/**
 * Annotate an expression to indicate it is a string field reference.
 * @param {string|object} expr The column name, or an existing wrapped
 *  expression for a column name.
 * @param {string} [name] The column name to use. If provided, will
 *  overwrite the input expression value.
 * @param {number} [table=0] The table index of the field, in case of
 *  expressions over multiple tables.
 * @return A wrapped expression for a named column.
 * @example field('colA')
 */
export default function(expr, name, table = 0) {
  const props = table ? { field: true, table } : { field: true };
  return wrap(
    expr,
    name ? { expr: name, ...props } : props
  );
}
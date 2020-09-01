/**
 * Annotate an expression in an object wrapper.
 * @param {string|Function|Object} expr An expression to annotate.
 * @param {Object} properties The properties to annotate with.
 * @return {Object} A new wrapped expression object.
 */
export default function(expr, properties) {
  return (expr && expr.expr != null)
    ? { ...expr, ...properties }
    : {
        expr,
        ...properties,
        toString: () => String(expr)
      };
}
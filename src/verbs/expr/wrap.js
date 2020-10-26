/**
 * Annotate an expression in an object wrapper.
 * @param {string|Function|Object} expr An expression to annotate.
 * @param {Object} properties The properties to annotate with.
 * @return {Object} A new wrapped expression object.
 */
export default function(expr, properties) {
  return expr instanceof Wrapper
    ? new Wrapper(expr.expr, { ...expr, ...properties })
    : new Wrapper(expr, properties);
}

class Wrapper {
  constructor(expr, properties) {
    Object.assign(this, properties);
    this.expr = expr;
  }
  toString() {
    return String(this.expr);
  }
  toObject() {
    return { ...this, expr: String(this.expr) };
  }
}
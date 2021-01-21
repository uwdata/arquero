import isFunction from '../util/is-function';

/**
 * Annotate an expression in an object wrapper.
 * @param {string|Function|object} expr An expression to annotate.
 * @param {object} properties The properties to annotate with.
 * @return {object} A new wrapped expression object.
 */
export default function(expr, properties) {
  return expr && expr.expr
    ? new Wrapper({ ...expr, ...properties })
    : new Wrapper(properties, expr);
}

class Wrapper {
  constructor(properties, expr) {
    this.expr = expr;
    Object.assign(this, properties);
  }
  toString() {
    return String(this.expr);
  }
  toObject() {
    return {
      ...this,
      expr: this.toString(),
      ...(isFunction(this.expr) ? { func: true } : {})
    };
  }
}
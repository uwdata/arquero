import { ArrowFunctionExpression, FunctionExpression } from './constants.js';

export function is(type, node) {
  return node && node.type === type;
}

export function isFunctionExpression(node) {
  return is(FunctionExpression, node)
    || is(ArrowFunctionExpression, node);
}

import { Column, Dictionary, Literal } from './ast/constants.js';
import { isArrayType } from '../util/is-array-type.js';
import { isFunction } from '../util/is-function.js';

const dictOps = {
  '==': 1,
  '!=': 1,
  '===': 1,
  '!==': 1
};

/**
 * Rewrite AST node to be a table column reference.
 * Additionally optimizes dictionary column operations.
 * @param {object} ref AST node to rewrite to a column reference.
 * @param {string} name The name of the column.
 * @param {number} [index] The table index of the column.
 * @param {object} [col] The actual table column instance.
 * @param {object} [op] Parent AST node operating on the column reference.
 */
export function rewrite(ref, name, index = 0, col = undefined, op = undefined) {
  ref.type = Column;
  ref.name = name;
  ref.table = index;

  // annotate arrays as such for optimized access
  if (isArrayType(col)) {
    ref.array = true;
  }

  // proceed only if has parent op and is a dictionary column
  if (op && col && isFunction(col.keyFor)) {
    // get other arg if op is an optimizeable operation
    const lit = dictOps[op.operator]
      ? op.left === ref ? op.right : op.left
      : op.callee && op.callee.name === 'equal'
      ? op.arguments[op.arguments[0] === ref ? 1 : 0]
      : null;

    // rewrite as dictionary lookup if other arg is a literal
    if (lit && lit.type === Literal) {
      rewriteDictionary(op, ref, lit, col.keyFor(lit.value));
    }
  }

  return ref;
}

function rewriteDictionary(op, ref, lit, key) {
  if (key < 0) {
    // value not in dictionary, rewrite op as false literal
    op.type = Literal;
    op.value = false;
    op.raw = 'false';
  } else {
    // rewrite ref as dict key access
    ref.type = Dictionary;

    // rewrite literal as target dict key
    lit.value = key;
    lit.raw = key + '';
  }

  return true;
}

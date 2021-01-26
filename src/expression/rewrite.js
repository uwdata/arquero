import { Column, Dictionary, Literal } from './ast/constants';
import isFunction from '../util/is-function';

const dictOps = {
  '==': 1,
  '!=': 1,
  '===': 1,
  '!==': 1
};

/**
 * Rewrite AST node to be a table column reference.
 * @param {object} ref AST node to rewrite to a column reference.
 * @param {object} op Parent AST node operating on the column reference.
 * @param {string} name The name of the column.
 * @param {number} index The table index of the column.
 * @param {object} col The actual table column instance.
 */
export default function(ref, op, name, index, col) {
  ref.type = Column;
  ref.name = name;
  ref.table = index;

  // return if no parent op or not a dictionary column
  if (!(op && col && isFunction(col.keyFor))) return;

  // get other arg if op is an optimizeable operation
  const lit = dictOps[op.operator]
    ? op.left === ref ? op.right : op.left
    : op.callee && op.callee.name === 'equal'
    ? op.arguments[op.arguments[0] === ref ? 1 : 0]
    : null;

  // rewrite as dictionary lookup is other arg is a literal
  if (lit && lit.type === Literal) {
    rewriteDictionary(op, ref, lit, col.keyFor(lit.value));
  }
}

function rewriteDictionary(op, ref, lit, key) {
  if (key < 0) {
    // rewrite op to be a false literal
    op.type = Literal;
    op.value = false;
    op.raw = 'false';
  } else {
    // rewrite ref to be dict key access
    ref.type = Dictionary;

    // rewrite literal to be the target dict key
    lit.value = key;
    lit.raw = key + '';
  }

  return true;
}
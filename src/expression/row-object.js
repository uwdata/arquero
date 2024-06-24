import { Literal, ObjectExpression, Property } from './ast/constants.js';
import codegen from './codegen.js';
import compile from './compile.js';
import rewrite from './rewrite.js';
import entries from '../util/entries.js';
import isArray from '../util/is-array.js';
import toString from '../util/to-string.js';

export const ROW_OBJECT = 'row_object';

export function rowObjectExpression(node, props) {
  node.type = ObjectExpression;

  const p = node.properties = [];
  for (const prop of entries(props)) {
    const [name, key] = isArray(prop) ? prop : [prop, prop];
    p.push({
      type: Property,
      key: { type: Literal, raw: toString(key) },
      value: rewrite({ computed: true }, name)
    });
  }

  return node;
}

export function rowObjectCode(props) {
  return codegen(rowObjectExpression({}, props));
}

export function rowObjectBuilder(props) {
  return compile.expr(rowObjectCode(props));
}

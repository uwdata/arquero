import { Literal, ObjectExpression, Property } from './ast/constants.js';
import { codegen } from './codegen.js';
import { compile } from './compile.js';
import { rewrite } from './rewrite.js';
import { entries } from '../util/entries.js';
import { isArray } from '../util/is-array.js';
import { toString } from '../util/to-string.js';

export const ROW_OBJECT = 'row_object';

export function rowObjectExpression(
  node,
  table,
  props = table.columnNames())
{
  node.type = ObjectExpression;

  const p = node.properties = [];
  for (const prop of entries(props)) {
    const [name, key] = isArray(prop) ? prop : [prop, prop];
    p.push({
      type: Property,
      key: { type: Literal, raw: toString(key) },
      value: rewrite({ computed: true }, name, 0, table.column(name))
    });
  }

  return node;
}

export function rowObjectCode(table, props) {
  return codegen(rowObjectExpression({}, table, props));
}

export function rowObjectBuilder(table, props) {
  return compile.expr(rowObjectCode(table, props));
}

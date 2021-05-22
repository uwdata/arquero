import codegen from './codegen';
import parse from './parse';
import { aggregate } from '../engine/reduce/util';

// generate code to compare a single field
const _compare = (u, v, lt, gt) =>
  `((u = ${u}) < (v = ${v}) || u == null) && v != null ? ${lt}
    : (u > v || v == null) && u != null ? ${gt}
    : ((v = v instanceof Date ? +v : v), (u = u instanceof Date ? +u : u)) !== u && v === v ? ${lt}
    : v !== v && u === u ? ${gt} : `;

export default function(table, fields) {
  // parse expressions, generate code for both a and b values
  const names = [];
  const exprs = [];
  const fn = [];
  let keys = null, opA = '0', opB = '0';
  if (table.isGrouped()) {
    keys = table.groups().keys;
    opA = 'ka';
    opB = 'kb';
  }
  const { ops } = parse(fields, {
    table,
    value: (name, node) => {
      names.push(name);
      if (node.escape) {
        // if an escaped function, invoke it directly
        const f = i => `fn[${fn.length}](${i}, data)`;
        exprs.push([f('a'), f('b')]);
        fn.push(node.escape);
      } else {
        // generate code to extract values to compare
        exprs.push([
          codegen(node, { index: 'a', op: opA }),
          codegen(node, { index: 'b', op: opB })
        ]);
      }
    },
    window: false
  });

  // calculate aggregate values if needed
  const result = aggregate(table, ops);
  const op = (id, row) => result[id][row];

  // generate comparison code for each field
  const n = names.length;
  let code = 'return (a, b) => {'
    + (op && table.isGrouped() ? 'const ka = keys[a], kb = keys[b];' : '')
    + 'let u, v; return ';
  for (let i = 0; i < n; ++i) {
    const o = fields.get(names[i]).desc ? -1 : 1;
    const [u, v] = exprs[i];
    code += _compare(u, v, -o, o);
  }
  code += '0;};';

  // instantiate and return comparator function
  return Function('op', 'keys', 'fn', 'data', code)(op, keys, fn, table.data());
}
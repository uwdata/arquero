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
  let opA = 'op';
  let opB = 'op';
  let keys = null;
  if (table.isGrouped()) {
    opA += '[ka]';
    opB += '[kb]';
    keys = table.groups().keys;
  }
  const { ops } = parse(fields, {
    table,
    value: (name, node) => {
      names.push(name);
      exprs.push([
        codegen(node, { index: 'a', op: opA }),
        codegen(node, { index: 'b', op: opB })
      ]);
    },
    window: false
  });

  // calculate aggregate values if needed
  const op = ops.length ? aggregate(table, ops) : null;

  // generate comparison code for each field
  const n = names.length;
  let code = 'return (a, b) => {\n';
  if (op && table.isGrouped()) {
    code += '  const ka = keys[a], kb = keys[b];\n';
  }
  code += '  var u, v;\n  return ';
  for (let i = 0; i < n; ++i) {
    const o = fields.get(names[i]).desc ? -1 : 1;
    const [u, v] = exprs[i];
    code += _compare(u, v, -o, o);
  }
  code += '0;\n};';

  // instantiate and return comparator function
  return (Function('op', 'keys', 'data', code))(op, keys, table.data());
}
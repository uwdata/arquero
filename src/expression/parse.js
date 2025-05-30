import { entries } from '../util/entries.js';
import { error } from '../util/error.js';
import { isFunction } from '../util/is-function.js';
import { isObject } from '../util/is-object.js';
import { Column, Literal, Op } from './ast/constants.js';
import { clean } from './ast/clean.js';
import { is } from './ast/util.js';
import { codegen } from './codegen.js';
import { compile}  from './compile.js';
import { parseEscape } from './parse-escape.js';
import { parseExpression } from './parse-expression.js';

const ANNOTATE = { [Column]: 1, [Op]: 1 };

export function parse(input, opt = {}) {
  const generate = opt.generate || codegen;
  const compiler = opt.compiler || compile;
  const params = getParams(opt);
  const fields = {};
  const opcall = {};
  const names = [];
  const exprs = [];
  let fieldId = 0;
  let opId = -1;

  const compileExpr = opt.join ? compiler.join
    : opt.index == 1 ? compiler.expr2
    : compiler.expr;

  // parser context
  const ctx = {
    op(op) {
      const key = opKey(op);
      return opcall[key] || (op.id = ++opId, opcall[key] = op);
    },
    field(node) {
      const code = generate(node);
      return fields[code] || (fields[code] = ++fieldId);
    },
    param(node) {
      return is(Literal, node)
        ? node.value
        : compiler.param(generate(node), params);
    },
    value(name, node) {
      names.push(name);
      const e = node.escape || (opt.ast
        ? clean(node)
        : compileExpr(generate(node), params));
      exprs.push(e);
      // annotate expression if it is a direct column or op access
      // this permits downstream optimizations
      if (ANNOTATE[node.type] && e !== node && isObject(e)) {
        e.field = node.name;
      }
    },
    error(node, msg, note = '') {
      // both expresions and fields are parsed
      // with added code prefixes of length 6!
      const i = node.start - 6;
      const j = node.end - 6;
      const snippet = String(ctx.spec).slice(i, j);
      error(`${msg}: "${snippet}"${note}`);
    }
  };

  // copy all options to context, potentially overwriting methods
  Object.assign(ctx, opt, { params });

  // parse each expression
  for (const [name, value] of entries(input)) {
    ctx.value(
      name + '',
      value.escape
        ? parseEscape(ctx, value, params)
        : parseExpression(ctx, value)
    );
  }

  // return expression asts if requested
  if (opt.ast) {
    return { names, exprs };
  }

  // compile input field accessors
  const f = [];
  for (const key in fields) {
    f[fields[key]] = compiler.expr(key, params);
  }

  // resolve input fields to operations
  const ops = Object.values(opcall);
  ops.forEach(op => op.fields = op.fields.map(id => f[id]));

  return { names, exprs, ops };
}

function opKey(op) {
  let key = `${op.name}(${op.fields.concat(op.params).join(',')})`;
  if (op.frame) {
    const frame = op.frame.map(v => Number.isFinite(v) ? Math.abs(v) : -1);
    key += `[${frame},${!!op.peers}]`;
  }
  return key;
}

function getParams(opt) {
  return (opt.table ? getTableParams(opt.table)
    : opt.join ? {
        ...getTableParams(opt.join[1]),
        ...getTableParams(opt.join[0])
      }
    : {}) || {};
}

function getTableParams(table) {
  return table && isFunction(table.params) ? table.params() : {};
}

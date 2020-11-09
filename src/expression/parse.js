import { parse } from 'acorn';

import {
  ArrowFunctionExpression,
  Column,
  Constant,
  Function,
  FunctionExpression,
  Identifier,
  Literal,
  MemberExpression,
  ObjectPattern,
  OpLookup,
  Parameter,
  Property
} from './ast/constants';
import clean from './ast/clean';
import walk from './ast/walk';

import codegen from './codegen';
import compile from './compile';
import constants from './constants';
import { getAggregate, getFunction, getWindow, isAggregate, isWindow } from '../op';
import has from '../util/has';
import error from '../util/error';

const PARSER_OPT = { ecmaVersion: 11 };
const DEFAULT_PARAM_ID = '$';
const DEFAULT_TUPLE_ID = 'd';
const DEFAULT_TUPLE_ID1 = 'd1';
const DEFAULT_TUPLE_ID2 = 'd2';

const is = (type, node) => node && node.type === type;
const isFunctionExpression = node =>
  is(FunctionExpression, node) ||
  is(ArrowFunctionExpression, node);

export default function(exprs, opt = {}) {
  const generate = opt.generate || codegen;
  const compiler = opt.compiler || compile;
  const params = getParams(opt);
  const fields = {};
  const opcall = {};
  const values = {};
  let fieldId = 0;
  let opId = -1;

  const compileExpr = opt.join ? compiler.join
    : opt.index == 1 ? compiler.expr2
    : compiler.expr;

  // parser context
  const ctx = {
    op(op) {
      const key = `${op.name}(${op.fields.concat(op.params).join(',')})`;
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
      values[name] = opt.ast
        ? clean(node)
        : compileExpr(generate(node), params);
    },
    error(msg, node) {
      // both expresions and fields are parsed
      // with added code prefixes of length 6!
      const i = node.start - 6;
      const j = node.end - 6;
      const snippet = String(ctx.spec).slice(i, j);
      error(`${msg}: "${snippet}"`);
    }
  };

  // copy all options to context, potentially overwriting methods
  Object.assign(ctx, opt, { params });

  // parse each expression
  for (const name in exprs) {
    parseExpression(ctx, name, exprs[name]);
  }

  // return expression asts if requested
  if (opt.ast) {
    return values;
  }

  // compile input field accessors
  const f = [];
  for (const key in fields) {
    f[fields[key]] = compiler.expr(key, params);
  }

  // resolve input fields to operations
  const ops = Object.values(opcall);
  ops.forEach(op => op.fields = op.fields.map(id => f[id]));

  return { ops, values };
}

const getParams = opt => {
  const p = opt.table ? opt.table.params()
    : opt.join ? { ...opt.join[1].params(), ...opt.join[0].params() }
    : {};
  return p || {};
};

const fieldRef = expr => {
  const col = JSON.stringify(expr+'');
  return !(expr.index || 0) ? `d=>d[${col}]` : `(a,b)=>b[${col}]`;
};

const functionName = (ctx, node) => is(Identifier, node) ? node.name
  : is(MemberExpression, node) ? node.property.name
  : null;

const parseError = msg => (node, ctx) => ctx.error(msg, node);

function handleIdentifier(node, ctx, parent) {
  const { name } = node;

  if (is(MemberExpression, parent) && parent.property === node) {
    // do nothing: check head node, not nested properties
  } else if (is(Property, parent) && parent.key === node) {
    // do nothing: identifiers allowed in object expressions
  } else if (ctx.paramsRef.has(name)) {
    updateParameterNode(node, ctx.paramsRef.get(name));
  } else if (ctx.columnRef.has(name)) {
    updateColumnNode(node, name, ctx);
  } else if (has(ctx.params, name)) {
    updateParameterNode(node, name);
  } else if (has(constants, name)) {
    updateConstantNode(node, name);
  } else {
    return true;
  }
}

function updateColumnNode(node, key, ctx) {
  const [name, index] = ctx.columnRef.get(key);

  // check column validity if we have a backing table
  const table = index === 0 ? ctx.table
    : index > 0 ? ctx.join[index - 1]
    : null;
  if (table && !has(table.data(), name)) {
    ctx.error(`Invalid column "${name}"`, ctx);
  }

  node.type = Column;
  node.name = name;
  node.index = index;
}

function updateParameterNode(node, name) {
  node.type = Parameter;
  node.name = name;
}

function updateConstantNode(node, name) {
  node.type = Constant;
  node.name = name;
  node.raw = constants[name];
}

const visitors = {
  FunctionDeclaration: parseError('Function definitions not allowed'),
  ForStatement: parseError('For loops not allowed'),
  ForOfStatement: parseError('For-of loops not allowed'),
  ForInStatement: parseError('For-in loops not allowed'),
  WhileStatement: parseError('While loops not allowed'),
  DoWhileStatement: parseError('Do-while loops not allowed'),
  AwaitExpression: parseError('Await expressions not allowed'),
  ArrowFunctionExpression: parseError('Function definitions not allowed'),
  AssignmentExpression: parseError('Assignments not allowed'),
  FunctionExpression: parseError('Function definitions not allowed'),
  NewExpression: parseError('Use of "new" not allowed'),
  UpdateExpression: parseError('Updates not allowed'),

  VariableDeclarator(node, ctx) {
    ctx.scope.add(node.id.name);
  },
  Identifier(node, ctx, parent) {
    if (handleIdentifier(node, ctx, parent) && !ctx.scope.has(node.name)) {
      // handle identifier passed responsibility here
      // raise error if identifier not defined in scope
      ctx.error('Invalid variable name', node);
    }
  },
  CallExpression(node, ctx) {
    const name = functionName(ctx, node.callee);
    const def = getAggregate(name) || getWindow(name);

    // parse operator and rewrite invocation
    if (def) {
      if ((ctx.join || ctx.aggregate === false) && isAggregate(def)) {
        ctx.error('Aggregate function not allowed', node);
      }
      if ((ctx.join || ctx.window === false) && isWindow(def)) {
        ctx.error('Window function not allowed', node);
      }

      if (ctx.ast) {
        node.callee = { type: Function, name };
        node.arguments.forEach(arg => walk(arg, ctx, opVisitors));
      } else {
        const op = ctx.op(parseOperator(ctx, def, name, node.arguments));
        Object.assign(node, {
          type: OpLookup,
          computed: true,
          object: { type: Identifier, name: 'op' },
          property: { type: Literal, raw: op.id }
        });
      }
      return false;
    } else if (getFunction(name)) {
      node.callee = { type: Function, name };
    } else {
      ctx.error('Illegal function call', node);
    }
  },
  MemberExpression(node, ctx) {
    const { object, property } = node;

    // bail if left head is not an identifier
    // in this case we will recurse and handle it later
    if (!is(Identifier, object)) return;
    const { name } = object;

    // allow use of Math prefix to access constant values
    if (name === 'Math' && is(Identifier, property)
        && has(constants, property.name)) {
      updateConstantNode(node, property.name);
      return;
    }

    const index = name === ctx.tuple ? 0
      : name === ctx.tuple1 ? 1
      : name === ctx.tuple2 ? 2
      : -1;

    if (index >= 0) {
      // replace member expression with column ref
      const table = index === 0 ? ctx.table : ctx.join[index - 1];
      const names = table ? table.data() : null;
      return spliceMember(node, { type: Column, index }, ctx, names);
    } else if (name === ctx.$param) {
      // replace member expression with param ref
      return spliceMember(node, { type: Parameter }, ctx, ctx.params);
    } else if (ctx.paramsRef.has(name)) {
      updateParameterNode(node, ctx.paramsRef.get(name));
    } else if (ctx.columnRef.has(name)) {
      updateColumnNode(object, name, ctx);
    } else if (has(ctx.params, name)) {
      updateParameterNode(object, name);
    }
  }
};

function spliceMember(node, props, ctx, values) {
  const { property } = node;
  const name = is(Identifier, property) ? { name: property.name }
    : is(Literal, property) ? { name: property.value, computed: true }
    : ctx.error('Invalid member expression', node);

  if (values && !has(values, name.name)) {
    ctx.error(`Invalid ${props.type.toLowerCase()} "${name.name}"`, node);
  }
  Object.assign(node, props, name);
  return false;
}

const opVisitors = {
  ...visitors,
  VariableDeclarator: parseError('Variable declarations not allowed within operator call'),
  Identifier(node, ctx, parent) {
    if (handleIdentifier(node, ctx, parent)) {
      ctx.error('Variable not accessible within operator call', node);
    }
  },
  CallExpression(node, ctx) {
    const name = functionName(ctx, node.callee);

    // rewrite if built-in function
    if (getFunction(name)) {
      node.callee = { type: Function, name };
    } else {
      ctx.error('Illegal function call', node);
    }
  }
};

function parser(expr) {
  try {
    const code = expr.field ? fieldRef(expr) : expr;
    return parse(`expr=(${code})`, PARSER_OPT).body[0].expression.right;
  } catch (err) {
    error(`Expression parse error: ${expr+''}`, err);
  }
}

export function parseExpression(ctx, name, spec) {
  const ast = parser(spec);
  let node = ctx.root = ast;
  ctx.spec = spec;
  ctx.tuple = null;
  ctx.tuple1 = null;
  ctx.tuple2 = null;
  ctx.$param = null;
  ctx.scope = new Set();
  ctx.paramsRef = new Map();
  ctx.columnRef = new Map();

  // parse input column parameters
  // if no function def, assume default tuple identifiers
  if (isFunctionExpression(node)) {
    parseFunction(node, ctx);
    node = node.body;
  } else if (ctx.join) {
    ctx.scope.add(ctx.tuple1 = DEFAULT_TUPLE_ID1);
    ctx.scope.add(ctx.tuple2 = DEFAULT_TUPLE_ID2);
    ctx.scope.add(ctx.$param = DEFAULT_PARAM_ID);
  } else {
    ctx.scope.add(ctx.tuple = DEFAULT_TUPLE_ID);
    ctx.scope.add(ctx.$param = DEFAULT_PARAM_ID);
  }

  // rewrite column references & function calls
  walk(node, ctx, visitors);

  ctx.value(name, ctx.root);
}

function parseFunction(node, ctx) {
  if (node.generator) ctx.error('Generator functions not allowed', node);
  if (node.async) ctx.error('Async functions not allowed', node);

  const { params } = node;
  const len = params.length;
  const setc = index => (name, key) => ctx.columnRef.set(name, [key, index]);
  const setp = (name, key) => ctx.paramsRef.set(name, key);

  if (!len) {
    // do nothing
  } else if (ctx.join) {
    parseRef(ctx, params[0], 'tuple1', setc(1));
    if (len > 1) parseRef(ctx, params[1], 'tuple2', setc(2));
    if (len > 2) parseRef(ctx, params[2], '$param', setp);
  } else {
    parseRef(ctx, params[0], 'tuple', setc(0));
    if (len > 1) parseRef(ctx, params[1], '$param', setp);
  }

  ctx.root = node.body;
}

function parseRef(ctx, node, refName, alias) {
  if (is(Identifier, node)) {
    ctx.scope.add(node.name);
    ctx[refName] = node.name;
  } else if (is(ObjectPattern, node)) {
    node.properties.forEach(p => {
      const key = is(Identifier, p.key) ? p.key.name
        : is(Literal, p.key) ? p.key.value
        : ctx.error('Invalid argument', p);
      if (!is(Identifier, p.value)) {
        ctx.error('Unsupported destructuring pattern', p.value);
      }
      alias(p.value.name, key);
    });
  }
}

function parseOperator(ctx, def, name, args) {
  const fields = [];
  const params = [];
  const idxFields = def.param[0] || 0;
  const idxParams = idxFields + (def.param[1] || 0);

  args.forEach((arg, index) => {
    if (index < idxFields) {
      walk(arg, ctx, opVisitors);
      fields.push(ctx.field(arg));
    } else if (index < idxParams) {
      walk(arg, ctx, opVisitors);
      params.push(ctx.param(arg));
    } else {
      ctx.error('Illegal operator parameter', arg);
    }
  });

  return { name, fields, params, ...(ctx.spec.window || {}) };
}
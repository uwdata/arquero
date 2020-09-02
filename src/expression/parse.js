import { parse } from 'acorn';
import constants from './constants';
import {
  isFunctionExpression, isIdentifier, isLiteral,
  isMemberExpression, isObjectPattern, isProperty
} from './util';
import codegen from './codegen';
import compile from './compile';
import walk from './walk';
import { getAggregate, getFunction, getWindow, isAggregate, isWindow } from '../op';
import has from '../util/has';
import error from '../util/error';

const PARSER_OPT = { ecmaVersion: 11 };
const DEFAULT_TUPLE_ID = 'd';
const DEFAULT_TUPLE_ID1 = 'd1';
const DEFAULT_TUPLE_ID2 = 'd2';
const Column = 'Column';

// ? TODO: support external parameter values
export default function(exprs, opt = {}) {
  const generate = opt.generate || codegen;
  const compiler = opt.compiler || compile;
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
      return isLiteral(node) ? node.value : compiler.param(generate(node));
    },
    value(name, node) {
      values[name] = compileExpr(generate(node));
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
  Object.assign(ctx, opt);

  // parse each expression
  for (const name in exprs) {
    parseExpression(ctx, name, exprs[name]);
  }

  // compile input field accessors
  const f = [];
  for (const key in fields) {
    f[fields[key]] = compiler.expr(key);
  }

  // resolve input fields to operations
  const ops = Object.values(opcall);
  ops.forEach(op => op.fields = op.fields.map(id => f[id]));

  return { ops, values };
}

const fieldRef = expr => {
  const col = JSON.stringify(expr+'');
  return !(expr.index || 0) ? `d=>d[${col}]` : `(a,b)=>b[${col}]`;
};

const functionName = (ctx, node) => {
  return isIdentifier(node) ? node.name
    : isMemberExpression(node) ? node.property.name
    : null;
};

function parseError(msg) {
  return (node, ctx) => ctx.error(msg, node);
}

function handleIdentifier(node, ctx, parent) {
  const { name } = node;

  if (isMemberExpression(parent) || isProperty(parent) && parent.key === node) {
    // do nothing
  } else if (ctx.columns.has(name)) {
    updateColumnNode(node, ctx.columns.get(name));
  } else if (has(constants, name)) {
    updateConstantNode(node, constants[name]);
  } else {
    return true;
  }
}

function updateColumnNode(node, entry) {
  node.type = Column;
  node.name = entry[0];
  node.index = entry[1];
}

function updateConstantNode(node, value) {
  node.name = value;
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
      ctx.error('Invalid identifier', node);
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
      const op = ctx.op(parseOperator(ctx, def, name, node.arguments));
      Object.assign(node, {
        type: 'OpLookup',
        computed: true,
        object: { type: 'Identifier', name: 'op' },
        property: { type: 'Literal', raw: op.id }
      });
      return false;
    } else if (getFunction(name)) {
      node.callee = {
        type: 'Identifier',
        name: `fn.${name}`,
        $skip: true
      };
    } else {
      ctx.error('Illegal function call', node);
    }
  },
  MemberExpression(node, ctx) {
    const { object, property } = node;
    if (isIdentifier(object)) {
      const index = object.name === ctx.tuple ? 0
        : object.name === ctx.tuple1 ? 1
        : object.name === ctx.tuple2 ? 2
        : null;
      if (index != null) {
        // replace member expression with column ref
        if (isIdentifier(property)) {
          Object.assign(node, { type: Column, name: property.name, index });
          return false;
        } else if (isLiteral(property)) {
          Object.assign(node, { type: Column, name: property.value, computed: true, index });
          return false;
        } else if (isMemberExpression(property)) {
          object.name = property.object.name;
          node.property = property.property;
        }
      } else if (ctx.columns.has(object.name)) {
        updateColumnNode(object, ctx.columns.get(object.name));
      }
    }
  }
};

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
      node.callee = {
        type: 'Identifier',
        name: `fn.${name}`,
        $skip: true
      };
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
  ctx.scope = new Set();
  ctx.columns = new Map();

  // parse input column parameters
  // if no function def, assume default tuple identifiers
  if (isFunctionExpression(node)) {
    parseFunction(node, ctx);
    node = node.body;
  } else if (ctx.join) {
    ctx.scope.add(ctx.tuple1 = DEFAULT_TUPLE_ID1);
    ctx.scope.add(ctx.tuple2 = DEFAULT_TUPLE_ID2);
  } else {
    ctx.scope.add(ctx.tuple = DEFAULT_TUPLE_ID);
  }

  // rewrite column references & function calls
  walk(node, ctx, visitors);

  ctx.value(name, ctx.root);
}

function parseFunction(node, ctx) {
  if (node.generator) ctx.error('Generator functions not allowed', node);
  if (node.async) ctx.error('Async functions not allowed', node);

  const { params } = node;

  if (params.length === 1) {
    parseFunctionParam(params[0], ctx.join ? 1 : 0, ctx);
  } else if (ctx.join && params.length === 2) {
    parseFunctionParam(params[0], 1, ctx);
    parseFunctionParam(params[1], 2, ctx);
  } else if (params.length > 0) {
    ctx.error('Table expressions with multiple arguments', node);
  }

  ctx.root = node.body;
}

function parseFunctionParam(node, index, ctx) {
  if (isIdentifier(node)) {
    ctx.scope.add(node.name);
    const t = 'tuple' + (index > 0 ? index : '');
    ctx[t] = node.name;
  } else if (isObjectPattern(node)) {
    node.properties.forEach(p => {
      const key = isIdentifier(p.key) ? p.key.name
        : isLiteral(p.key) ? p.key.value
        : ctx.error('Invalid parameter', p);
      ctx.columns.set(p.value.name, [key, index]);
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
import { parse } from 'acorn';

import {
  ArrayPattern,
  ArrowFunctionExpression,
  Column,
  Constant,
  Function,
  FunctionExpression,
  Identifier,
  Literal,
  MemberExpression,
  ObjectPattern,
  Op,
  Parameter,
  Property
} from './ast/constants';
import clean from './ast/clean';
import walk from './ast/walk';

import codegen from './codegen';
import compile from './compile';
import constants from './constants';
import rewrite from './rewrite';
import { getAggregate, getFunction, getWindow, isAggregate, isWindow } from '../op';
import entries from '../util/entries';
import isFunction from '../util/is-function';
import has from '../util/has';
import error from '../util/error';
import isObject from '../util/is-object';

const PARSER_OPT = { ecmaVersion: 11 };
const DEFAULT_PARAM_ID = '$';
const DEFAULT_TUPLE_ID = 'd';
const DEFAULT_TUPLE_ID1 = 'd1';
const DEFAULT_TUPLE_ID2 = 'd2';

const NO = msg => (node, ctx) => ctx.error(msg + ' not allowed', node);
const ERROR_AGGREGATE = NO('Aggregate function');
const ERROR_WINDOW = NO('Window function');
const ERROR_ARGUMENT = 'Invalid argument';
const ERROR_COLUMN = 'Invalid column reference';
const ERROR_AGGRONLY = ERROR_COLUMN + ' (must be input to an aggregate function)';
const ERROR_FUNCTION = 'Invalid function call';
const ERROR_MEMBER = 'Invalid member expression';
const ERROR_OP_PARAMETER = 'Invalid operator parameter';
const ERROR_PARAM = 'Invalid param reference';
const ERROR_VARIABLE = 'Invalid variable reference';
const ERROR_VARIABLE_OP = 'Variable not accessible in operator call';
const ERROR_DECLARATION = 'Unsupported variable declaration';
const ERROR_DESTRUCTURE = 'Unsupported destructuring pattern';

const ANNOTATE = { [Column]: 1, [Op]: 1 };

const is = (type, node) => node && node.type === type;
const isFunctionExpression = node =>
  is(FunctionExpression, node) ||
  is(ArrowFunctionExpression, node);

export default function(input, opt = {}) {
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
      names.push(name);
      const e = opt.ast ? clean(node) : compileExpr(generate(node), params);
      exprs.push(e);
      // annotate expression if it is a direct column or op access
      // this permits downstream optimizations
      if (ANNOTATE[node.type] && e !== node && isObject(e)) {
        e.field = node.name;
      }
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
  for (const [name, value] of entries(input)) {
    parseExpression(ctx, name + '', value);
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

const getParams = opt => {
  return (opt.table ? getTableParams(opt.table)
    : opt.join ? {
        ...getTableParams(opt.join[1]),
        ...getTableParams(opt.join[0])
      }
    : {}) || {};
};

const getTableParams = table =>
  table && isFunction(table.params) ? table.params() : {};

const fieldRef = expr => {
  const col = JSON.stringify(expr+'');
  return !(expr.table || 0) ? `d=>d[${col}]` : `(a,b)=>b[${col}]`;
};

const isMath = node =>
  is(Identifier, node.object) && node.object.name === 'Math';

const rewriteMath = name => name === 'max' ? 'greatest'
  : name === 'min' ? 'least'
  : name;

const functionName = (ctx, node) => is(Identifier, node) ? node.name
  : !is(MemberExpression, node) ? null
  : isMath(node) ? rewriteMath(node.property.name)
  : node.property.name;

function handleIdentifier(node, ctx, parent) {
  const { name } = node;

  if (is(MemberExpression, parent) && parent.property === node) {
    // do nothing: check head node, not nested properties
  } else if (is(Property, parent) && parent.key === node) {
    // do nothing: identifiers allowed in object expressions
  } else if (ctx.paramsRef.has(name)) {
    updateParameterNode(node, ctx.paramsRef.get(name));
  } else if (ctx.columnRef.has(name)) {
    updateColumnNode(node, name, ctx, parent);
  } else if (has(ctx.params, name)) {
    updateParameterNode(node, name);
  } else if (has(constants, name)) {
    updateConstantNode(node, name);
  } else {
    return true;
  }
}

function checkColumn(node, name, index, ctx, parent) {
  // check column existence if we have a backing table
  const table = index === 0 ? ctx.table
    : index > 0 ? ctx.join[index - 1]
    : null;
  const col = table && table.column(name);
  if (table && !col) {
    ctx.error(ERROR_COLUMN, node);
  }

  // check if column reference is valid in current context
  if (ctx.aggronly && !ctx.$op) {
    if (!ctx.$op) {
      ctx.error(ERROR_AGGRONLY, node);
    }
  }

  // rewrite ast node as a column access
  rewrite(node, parent, name, index, col);
}

function updateColumnNode(node, key, ctx, parent) {
  const [name, index] = ctx.columnRef.get(key);
  checkColumn(node, name, index, ctx, parent);
}

function checkParam(node, name, index, ctx) {
  if (ctx.params && !has(ctx.params, name)) {
    ctx.error(ERROR_PARAM, node);
  }
  updateParameterNode(node, name);
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

function handleDeclaration(node, ctx) {
  if (is(Identifier, node)) {
    ctx.scope.add(node.name);
  } else if (is(ArrayPattern, node)) {
    node.elements.forEach(elm => handleDeclaration(elm, ctx));
  } else if (is(ObjectPattern, node)) {
    node.properties.forEach(prop => handleDeclaration(prop.value, ctx));
  } else {
    ctx.error(ERROR_DECLARATION, node.id);
  }
}

const visitors = {
  FunctionDeclaration: NO('Function definitions'),
  ForStatement: NO('For loops'),
  ForOfStatement: NO('For-of loops'),
  ForInStatement: NO('For-in loops'),
  WhileStatement: NO('While loops'),
  DoWhileStatement: NO('Do-while loops'),
  AwaitExpression: NO('Await expressions'),
  ArrowFunctionExpression: NO('Function definitions'),
  AssignmentExpression: NO('Assignments'),
  FunctionExpression: NO('Function definitions'),
  NewExpression: NO('Use of "new"'),
  UpdateExpression: NO('Update expressions'),

  VariableDeclarator(node, ctx) {
    handleDeclaration(node.id, ctx);
  },
  Identifier(node, ctx, parent) {
    if (handleIdentifier(node, ctx, parent) && !ctx.scope.has(node.name)) {
      // handle identifier passed responsibility here
      // raise error if identifier not defined in scope
      ctx.error(ERROR_VARIABLE, node);
    }
  },
  CallExpression(node, ctx) {
    const name = functionName(ctx, node.callee);
    const def = getAggregate(name) || getWindow(name);

    // parse operator and rewrite invocation
    if (def) {
      if ((ctx.join || ctx.aggregate === false) && isAggregate(def)) {
        ERROR_AGGREGATE(node, ctx);
      }
      if ((ctx.join || ctx.window === false) && isWindow(def)) {
        ERROR_WINDOW(node, ctx);
      }

      ctx.$op = 1;
      if (ctx.ast) {
        node.callee = { type: Function, name };
        node.arguments.forEach(arg => walk(arg, ctx, opVisitors));
      } else {
        const op = ctx.op(parseOperator(ctx, def, name, node.arguments));
        Object.assign(node, { type: Op, name: op.id });
      }
      ctx.$op = 0;
      return false;
    } else if (getFunction(name)) {
      node.callee = { type: Function, name };
    } else {
      ctx.error(ERROR_FUNCTION, node);
    }
  },
  MemberExpression(node, ctx, parent) {
    const { object, property } = node;

    // bail if left head is not an identifier
    // in this case we will recurse and handle it later
    if (!is(Identifier, object)) return;
    const { name } = object;

    // allow use of Math prefix to access constant values
    if (isMath(node) && is(Identifier, property)
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
      return spliceMember(node, index, ctx, checkColumn, parent);
    } else if (name === ctx.$param) {
      // replace member expression with param ref
      return spliceMember(node, index, ctx, checkParam);
    } else if (ctx.paramsRef.has(name)) {
      updateParameterNode(node, ctx.paramsRef.get(name));
    } else if (ctx.columnRef.has(name)) {
      updateColumnNode(object, name, ctx, node);
    } else if (has(ctx.params, name)) {
      updateParameterNode(object, name);
    }
  }
};

function spliceMember(node, index, ctx, check, parent) {
  const { property, computed } = node;
  let name;

  if (!computed) {
    name = property.name;
  } else if (is(Literal, property)) {
    name = property.value;
  } else try {
    name = ctx.param(property);
  } catch (e) {
    ctx.error(ERROR_MEMBER, node);
  }

  check(node, name, index, ctx, parent);
  return false;
}

const opVisitors = {
  ...visitors,
  VariableDeclarator: NO('Variable declaration in operator call'),
  Identifier(node, ctx, parent) {
    if (handleIdentifier(node, ctx, parent)) {
      ctx.error(ERROR_VARIABLE_OP, node);
    }
  },
  CallExpression(node, ctx) {
    const name = functionName(ctx, node.callee);

    // rewrite if built-in function
    if (getFunction(name)) {
      node.callee = { type: Function, name };
    } else {
      ctx.error(ERROR_FUNCTION, node);
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
  ctx.$op = 0;
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
  if (node.generator) NO('Generator functions')(node, ctx);
  if (node.async) NO('Async functions')(node, ctx);

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
        : ctx.error(ERROR_ARGUMENT, p);
      if (!is(Identifier, p.value)) {
        ctx.error(ERROR_DESTRUCTURE, p.value);
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
      ctx.error(ERROR_OP_PARAMETER, arg);
    }
  });

  return { name, fields, params, ...(ctx.spec.window || {}) };
}
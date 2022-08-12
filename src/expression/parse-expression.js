import { parse } from 'acorn';
import {
  ArrayPattern,
  Constant,
  Function,
  Identifier,
  Literal,
  MemberExpression,
  ObjectPattern,
  Op,
  Parameter,
  Property
} from './ast/constants';
import { is, isFunctionExpression } from './ast/util';
import walk from './ast/walk';
import constants from './constants';
import rewrite from './rewrite';
import { ROW_OBJECT, rowObjectExpression } from './row-object';
import {
  getAggregate, getWindow,
  hasAggregate, hasFunction, hasWindow
} from '../op';

import error from '../util/error';
import has from '../util/has';
import isArray from '../util/is-array';
import isNumber from '../util/is-number';
import toString from '../util/to-string';

const PARSER_OPT = { ecmaVersion: 11 };
const DEFAULT_PARAM_ID = '$';
const DEFAULT_TUPLE_ID = 'd';
const DEFAULT_TUPLE_ID1 = 'd1';
const DEFAULT_TUPLE_ID2 = 'd2';

const NO = msg => (node, ctx) => ctx.error(node, msg + ' not allowed');
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
const ERROR_CLOSURE = 'Table expressions do not support closures';
const ERROR_ESCAPE = 'Use aq.escape(fn) to use a function as-is (including closures)';
const ERROR_USE_PARAMS = 'use table.params({ name: value }) to define dynamic parameters';
const ERROR_ADD_FUNCTION = 'use aq.addFunction(name, fn) to add new op functions';
const ERROR_VARIABLE_NOTE = `\nNote: ${ERROR_CLOSURE}. ${ERROR_ESCAPE}, or ${ERROR_USE_PARAMS}.`;
const ERROR_FUNCTION_NOTE = `\nNote: ${ERROR_CLOSURE}. ${ERROR_ESCAPE}, or ${ERROR_ADD_FUNCTION}.`;
const ERROR_ROW_OBJECT = `The ${ROW_OBJECT} method is not valid in multi-table expressions.`;

export default function parseExpression(ctx, spec) {
  const ast = parseAST(spec);
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

  return ctx.root;
}

function parseAST(expr) {
  try {
    const code = expr.field ? fieldRef(expr)
      : isArray(expr) ? toString(expr)
      : expr;
    return parse(`expr=(${code})`, PARSER_OPT).body[0].expression.right;
  } catch (err) {
    error(`Expression parse error: ${expr+''}`, err);
  }
}

function fieldRef(expr) {
  const col = JSON.stringify(expr+'');
  return !(expr.table || 0) ? `d=>d[${col}]` : `(a,b)=>b[${col}]`;
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
      ctx.error(node, ERROR_VARIABLE, ERROR_VARIABLE_NOTE);
    }
  },
  CallExpression(node, ctx) {
    const name = functionName(node.callee);
    const def = getAggregate(name) || getWindow(name);

    // parse operator and rewrite invocation
    if (def) {
      if ((ctx.join || ctx.aggregate === false) && hasAggregate(name)) {
        ERROR_AGGREGATE(node, ctx);
      }
      if ((ctx.join || ctx.window === false) && hasWindow(name)) {
        ERROR_WINDOW(node, ctx);
      }

      ctx.$op = 1;
      if (ctx.ast) {
        updateFunctionNode(node, name, ctx);
        node.arguments.forEach(arg => walk(arg, ctx, opVisitors));
      } else {
        const op = ctx.op(parseOperator(ctx, def, name, node.arguments));
        Object.assign(node, { type: Op, name: op.id });
      }
      ctx.$op = 0;
      return false;
    } else if (hasFunction(name)) {
      updateFunctionNode(node, name, ctx);
    } else {
      ctx.error(node, ERROR_FUNCTION, ERROR_FUNCTION_NOTE);
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
    ctx.error(node, ERROR_MEMBER);
  }

  check(node, name, index, ctx, parent);
  return false;
}

const opVisitors = {
  ...visitors,
  VariableDeclarator: NO('Variable declaration in operator call'),
  Identifier(node, ctx, parent) {
    if (handleIdentifier(node, ctx, parent)) {
      ctx.error(node, ERROR_VARIABLE_OP);
    }
  },
  CallExpression(node, ctx) {
    const name = functionName(node.callee);

    // rewrite if built-in function
    if (hasFunction(name)) {
      updateFunctionNode(node, name, ctx);
    } else {
      ctx.error(node, ERROR_FUNCTION, ERROR_FUNCTION_NOTE);
    }
  }
};

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
        : ctx.error(p, ERROR_ARGUMENT);
      if (!is(Identifier, p.value)) {
        ctx.error(p.value, ERROR_DESTRUCTURE);
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
      ctx.error(arg, ERROR_OP_PARAMETER);
    }
  });

  return { name, fields, params, ...(ctx.spec.window || {}) };
}

function functionName(node) {
  return is(Identifier, node) ? node.name
    : !is(MemberExpression, node) ? null
    : isMath(node) ? rewriteMath(node.property.name)
    : node.property.name;
}

function isMath(node) {
  return is(Identifier, node.object) && node.object.name === 'Math';
}

function rewriteMath(name) {
  return name === 'max' ? 'greatest'
    : name === 'min' ? 'least'
    : name;
}

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
    ctx.error(node, ERROR_COLUMN);
  }

  // check if column reference is valid in current context
  if (ctx.aggronly && !ctx.$op) {
    ctx.error(node, ERROR_AGGRONLY);
  }

  // rewrite ast node as a column access
  rewrite(node, name, index, col, parent);
}

function updateColumnNode(node, key, ctx, parent) {
  const [name, index] = ctx.columnRef.get(key);
  checkColumn(node, name, index, ctx, parent);
}

function checkParam(node, name, index, ctx) {
  if (ctx.params && !has(ctx.params, name)) {
    ctx.error(node, ERROR_PARAM);
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

function updateFunctionNode(node, name, ctx) {
  if (name === ROW_OBJECT) {
    const t = ctx.table;
    if (!t) ctx.error(node, ERROR_ROW_OBJECT);
    rowObjectExpression(node,
      node.arguments.length
        ? node.arguments.map(node => {
            const col = ctx.param(node);
            const name = isNumber(col) ? t.columnName(col) : col;
            if (!t.column(name)) ctx.error(node, ERROR_COLUMN);
            return name;
          })
        : t.columnNames()
    );
  } else {
    node.callee = { type: Function, name };
  }
}

function handleDeclaration(node, ctx) {
  if (is(Identifier, node)) {
    ctx.scope.add(node.name);
  } else if (is(ArrayPattern, node)) {
    node.elements.forEach(elm => handleDeclaration(elm, ctx));
  } else if (is(ObjectPattern, node)) {
    node.properties.forEach(prop => handleDeclaration(prop.value, ctx));
  } else {
    ctx.error(node.id, ERROR_DECLARATION);
  }
}
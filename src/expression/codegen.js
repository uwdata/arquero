import error from '../util/error';
import toString from '../util/to-string';

const visit = (node, opt) => {
  const f = visitors[node.type];
  return f
    ? f(node, opt)
    : error(`Unsupported expression construct: ${node.type}`);
};

const binary = (node, opt) => {
  return '(' + visit(node.left, opt) + ' ' + node.operator + ' ' + visit(node.right, opt) + ')';
};

const func = (node, opt) => {
  return '(' + list(node.params, opt) + ')=>' + visit(node.body, opt);
};

const call = (node, opt) => {
  return visit(node.callee, opt) + '(' + list(node.arguments, opt) + ')';
};

const list = (array, opt, delim = ',') => {
  return array.map(node => visit(node, opt)).join(delim);
};

const name = node => node.computed
  ? `[${toString(node.name)}]`
  : `.${node.name}`;

const ref = (node, opt, method) => {
  const table = node.table || '';
  return `data${table}${name(node)}.${method}(${opt.index}${table})`;
};

const visitors = {
  Constant: node => node.raw,
  Column: (node, opt) => ref(node, opt, 'get'),
  Dictionary: (node, opt) => ref(node, opt, 'key'),
  Function: node => `fn.${node.name}`,
  Parameter: node => `$${name(node)}`,
  Op: (node, opt) => `op(${toString(node.name)},${opt.op || opt.index})`,
  Literal: node => node.raw,
  Identifier: node => node.name,
  TemplateLiteral: (node, opt) => {
    const { quasis, expressions } = node;
    const n = expressions.length;
    let t = quasis[0].value.raw;
    for (let i = 0; i < n;) {
      t += '${' + visit(expressions[i], opt) + '}' + quasis[++i].value.raw;
    }
    return '`' + t + '`';
  },
  MemberExpression: (node, opt) => {
    const d = !node.computed;
    const o = visit(node.object, opt);
    const p = visit(node.property, opt);
    return o + (d ? '.' + p : '[' + p + ']');
  },
  CallExpression: call,
  NewExpression: (node, opt) => {
    return 'new ' + call(node, opt);
  },
  ArrayExpression: (node, opt) => {
    return '[' + list(node.elements, opt) + ']';
  },
  AssignmentExpression: binary,
  BinaryExpression: binary,
  LogicalExpression: binary,
  UnaryExpression: (node, opt) => {
    return '(' + node.operator + visit(node.argument, opt) + ')';
  },
  ConditionalExpression: (node, opt) => {
    return '(' + visit(node.test, opt) +
      '?' + visit(node.consequent, opt) +
      ':' + visit(node.alternate, opt) + ')';
  },
  ObjectExpression: (node, opt) => {
    return '({' + list(node.properties, opt) + '})';
  },
  Property: (node, opt) => {
    const key = visit(node.key, opt);
    return (node.computed ? `[${key}]` : key) + ':' + visit(node.value, opt);
  },

  ArrowFunctionExpression: func,
  FunctionExpression: func,
  FunctionDeclaration: func,

  ArrayPattern: (node, opt) => {
    return '[' + list(node.elements, opt) + ']';
  },
  ObjectPattern: (node, opt) => {
    return '{' + list(node.properties, opt) + '}';
  },
  VariableDeclaration: (node, opt) => {
    return node.kind + ' ' + list(node.declarations, opt, ',');
  },
  VariableDeclarator: (node, opt) => {
    return visit(node.id, opt) + '=' + visit(node.init, opt);
  },
  SpreadElement: (node, opt) => {
    return '...' + visit(node.argument, opt);
  },

  BlockStatement: (node, opt) => {
    return '{' + list(node.body, opt, ';') + ';}';
  },
  BreakStatement: () => {
    return 'break';
  },
  ExpressionStatement: (node, opt) => {
    return visit(node.expression, opt);
  },
  IfStatement: (node, opt) => {
    return 'if (' + visit(node.test, opt) + ')'
      + visit(node.consequent, opt)
      + (node.alternate ? ' else ' + visit(node.alternate, opt) : '');
  },
  SwitchStatement: (node, opt) => {
    return 'switch (' + visit(node.discriminant, opt) + ') {'
     + list(node.cases, opt, '')
     + '}';
  },
  SwitchCase: (node, opt) => {
    return (node.test ? 'case ' + visit(node.test, opt) : 'default')
      + ': '
      + list(node.consequent, opt, ';') + ';';
  },
  ReturnStatement: (node, opt) => {
    return 'return ' + visit(node.argument, opt);
  },
  Program: (node, opt) => visit(node.body[0], opt)
};

export default function(node, opt = { index: 'row' }) {
  return visit(node, opt);
}
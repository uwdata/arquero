export default function walk(node, ctx, visitors, parent) {
  const visit = visitors[node.type] || visitors['Default'];
  if (visit && visit(node, ctx, parent) === false) return;

  const walker = walkers[node.type];
  if (walker) walker(node, ctx, visitors);
}

const unary = (node, ctx, visitors) => {
  walk(node.argument, ctx, visitors, node);
};

const binary = (node, ctx, visitors) => {
  walk(node.left, ctx, visitors, node);
  walk(node.right, ctx, visitors, node);
};

const ternary = (node, ctx, visitors) => {
  walk(node.test, ctx, visitors, node);
  walk(node.consequent, ctx, visitors, node);
  if (node.alternate) walk(node.alternate, ctx, visitors, node);
};

const func = (node, ctx, visitors) => {
  list(node.params, ctx, visitors, node);
  walk(node.body, ctx, visitors, node);
};

const call = (node, ctx, visitors) => {
  walk(node.callee, ctx, visitors, node);
  list(node.arguments, ctx, visitors, node);
};

const list = (nodes, ctx, visitors, node) => {
  nodes.forEach(item => walk(item, ctx, visitors, node));
};

const walkers = {
  TemplateLiteral: (node, ctx, visitors) => {
    list(node.expressions, ctx, visitors, node);
    list(node.quasis, ctx, visitors, node);
  },
  MemberExpression: (node, ctx, visitors) => {
    walk(node.object, ctx, visitors, node);
    walk(node.property, ctx, visitors, node);
  },
  CallExpression: call,
  NewExpression: call,
  ArrayExpression: (node, ctx, visitors) => {
    list(node.elements, ctx, visitors, node);
  },
  AssignmentExpression: binary,
  AwaitExpression: unary,
  BinaryExpression: binary,
  LogicalExpression: binary,
  UnaryExpression: unary,
  UpdateExpression: unary,
  ConditionalExpression: ternary,
  ObjectExpression: (node, ctx, visitors) => {
    list(node.properties, ctx, visitors, node);
  },
  Property: (node, ctx, visitors) => {
    walk(node.key, ctx, visitors, node);
    walk(node.value, ctx, visitors, node);
  },

  ArrowFunctionExpression: func,
  FunctionExpression: func,
  FunctionDeclaration: func,

  VariableDeclaration: (node, ctx, visitors) => {
    list(node.declarations, ctx, visitors, node);
  },
  VariableDeclarator: (node, ctx, visitors) => {
    walk(node.id, ctx, visitors, node);
    walk(node.init, ctx, visitors, node);
  },
  SpreadElement: (node, ctx, visitors) => {
    walk(node.argument, ctx, visitors, node);
  },

  BlockStatement: (node, ctx, visitors) => {
    list(node.body, ctx, visitors, node);
  },
  ExpressionStatement: (node, ctx, visitors) => {
    walk(node.expression, ctx, visitors, node);
  },
  IfStatement: ternary,
  ForStatement: (node, ctx, visitors) => {
    walk(node.init, ctx, visitors, node);
    walk(node.test, ctx, visitors, node);
    walk(node.update, ctx, visitors, node);
    walk(node.body, ctx, visitors, node);
  },
  WhileStatement: (node, ctx, visitors) => {
    walk(node.test, ctx, visitors, node);
    walk(node.body, ctx, visitors, node);
  },
  DoWhileStatement: (node, ctx, visitors) => {
    walk(node.body, ctx, visitors, node);
    walk(node.test, ctx, visitors, node);
  },
  SwitchStatement: (node, ctx, visitors) => {
    walk(node.discriminant, ctx, visitors, node);
    list(node.cases, ctx, visitors, node);
  },
  SwitchCase: (node, ctx, visitors) => {
    if (node.test) walk(node.test, ctx, visitors, node);
    list(node.consequent, ctx, visitors, node);
  },
  ReturnStatement: unary,

  Program: (node, ctx, visitors) => {
    walk(node.body[0], ctx, visitors, node);
  }
};
const is = type => node => node && node.type === type;

export const isLiteral = is('Literal');

export const isIdentifier = is('Identifier');

export const isObjectPattern = is('ObjectPattern');

export const isProperty = is('Property');

export const isMemberExpression = is('MemberExpression');

export const isFunctionExpression = node =>
  node.type === 'FunctionExpression' ||
  node.type === 'ArrowFunctionExpression';
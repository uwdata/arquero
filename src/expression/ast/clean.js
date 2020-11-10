import walk from './walk';

function strip(node) {
  delete node.start;
  delete node.end;
  delete node.optional;
}

function stripMember(node) {
  strip(node);
  delete node.object;
  delete node.property;
  delete node.computed;
  if (!node.table) delete node.table;
}

export default function(ast) {
  walk(ast, null, {
    Column: stripMember,
    Constant: stripMember,
    Default: strip
  });
  return ast;
}
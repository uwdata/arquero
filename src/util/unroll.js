export default function(args, code, ...lists) {
  const v = ['_', '$'];
  const a = v.slice(0, lists.length);
  a.push('"use strict"; const '
    + lists
        .map((l, j) => l.map((_, i) => `${v[j]}${i} = ${v[j]}[${i}]`).join(', '))
        .join(', ')
    + `; return (${args}) => ${code};`
  );
  return Function(...a)(...lists);
}
export default function(list, args, code) {
  return Function('_',
    '"use strict"; const '
    + list.map((_, i) => `_${i} = _[${i}]`).join(', ')
    + `; return (${args}) => ${code};`
  )(list);
}
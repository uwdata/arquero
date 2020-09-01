export default function(list1, list2, args, code) {
  return Function('_', '$',
    '"use strict"; const '
    + list1.map((_, i) => `_${i} = _[${i}]`).join(', ')
    + '; const '
    + list2.map((_, i) => `$${i} = $[${i}]`).join(', ')
    + `; return (${args}) => ${code};`
  )(list1, list2);
}
// eslint-disable-next-line no-unused-vars
export default function(list, fn = ((x, i) => x), delim = '') {
  const n = list.length;
  if (!n) return '';

  let s = fn(list[0], 0);
  for (let i = 1; i < n; ++i) {
    s += delim + fn(list[i], i);
  }

  return s;
}

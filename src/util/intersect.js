export default function intersect(a, b) {
  const set = new Set(b);
  return a.filter(x => set.has(x));
}
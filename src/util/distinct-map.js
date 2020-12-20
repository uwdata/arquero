import { key } from './key-function';

export default function() {
  const map = new Map();
  return {
    count() {
      return map.size;
    },
    values() {
      return Array.from(map.values(), _ => _.v);
    },
    increment(v) {
      const k = key(v);
      const e = map.get(k);
      e ? ++e.n : map.set(k, { v, n: 1 });
    },
    decrement(v) {
      const k = key(v);
      const e = map.get(k);
      e.n === 1 ? map.delete(k) : --e.n;
    },
    forEach(fn) {
      map.forEach(({ v, n }) => fn(v, n));
    }
  };
}
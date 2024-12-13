import { entries } from './entries.js';

export function assign(map, pairs) {
  for (const [key, value] of entries(pairs)) {
    map.set(key, value);
  }
  return map;
}

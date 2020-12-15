import entries from './entries';

export default function(map, pairs) {
  for (const [key, value] of entries(pairs)) {
    map.set(key, value);
  }
  return map;
}
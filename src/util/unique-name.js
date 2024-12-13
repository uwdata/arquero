import { isMapOrSet } from './is-map-or-set.js';

export function uniqueName(names, name) {
  names = isMapOrSet(names) ? names : new Set(names);
  let uname = name;
  let index = 0;

  while (names.has(uname)) {
    uname = name + ++index;
  }

  return uname;
}

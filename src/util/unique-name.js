import isMapOrSet from './is-map-or-set';

export default function(names, name) {
  names = isMapOrSet(names) ? names : new Set(names);
  let uname = name;
  let index = 0;

  while (names.has(uname)) {
    uname = name + ++index;
  }

  return uname;
}
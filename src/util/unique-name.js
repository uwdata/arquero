export default function(names, prefix) {
  const set = new Set(names);
  let name = prefix;
  let index = 0;
  while (set.has(name)) {
    name = `${prefix}_${++index}`;
  }
  return name;
}
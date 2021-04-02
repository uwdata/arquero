export function singleRowLookup(table, hash) {
  const lut = new Map();
  table.scan((row, data) => {
    const key = hash(row, data);
    if (key != null && key === key) {
      lut.set(key, row);
    }
  });
  return lut;
}

export function multiRowLookup(idx, data, hash) {
  const lut = new Map();
  const n = idx.length;
  for (let i = 0; i < n; ++i) {
    const row = idx[i];
    const key = hash(row, data);
    if (key != null && key === key) {
      lut.has(key)
        ? lut.get(key).push(row)
        : lut.set(key, [row]);
    }
  }
  return lut;
}
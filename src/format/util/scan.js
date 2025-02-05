import { identity } from '../../util/identity.js';

export function scan(table, names, limit = 100, offset, ctx) {
  const { start = identity, cell, end = identity } = ctx;
  const data = table.data();
  const n = names.length;
  table.scan(row => {
    start(row);
    for (let i = 0; i < n; ++i) {
      const name = names[i];
      cell(data[name].at(row), name, i);
    }
    end(row);
  }, true, limit, offset);
}

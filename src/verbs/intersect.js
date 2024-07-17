import { dedupe } from './dedupe.js';
import { semijoin } from './join-filter.js';

export function intersect(table, ...others) {
  others = others.flat();
  const names = table.columnNames();
  return others.length
    ? dedupe(others.reduce((a, b) => semijoin(a, b.select(names)), table))
    : table.reify([]);
}

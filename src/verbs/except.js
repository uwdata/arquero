import { dedupe } from './dedupe.js';
import { antijoin } from './join-filter.js';

export function except(table, ...others) {
  others = others.flat();
  if (others.length === 0) return table;
  const names = table.columnNames();
  return dedupe(others.reduce((a, b) => antijoin(a, b.select(names)), table));
}

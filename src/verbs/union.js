import { dedupe } from './dedupe.js';

export function union(table, others) {
  return dedupe(table.concat(others));
}

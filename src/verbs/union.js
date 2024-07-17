import { concat } from './concat.js';
import { dedupe } from './dedupe.js';

export function union(table, ...others) {
  return dedupe(concat(table, others.flat()));
}

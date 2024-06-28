import { groupby } from './groupby.js';
import { filter } from './filter.js';

export function dedupe(table, keys = []) {
  const gt = groupby(table, keys.length ? keys : table.columnNames());
  return filter(gt, 'row_number() === 1').ungroup().reify();
}

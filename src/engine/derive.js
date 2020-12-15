import { window } from './window/window';
import { aggregate } from './reduce/util';
import { isWindow } from '../op';
import columnSet from '../table/column-set';
import toArray from '../util/to-array';

function isWindowed(op) {
  return isWindow(op.name) ||
    op.frame && (
      Number.isFinite(op.frame[0]) ||
      Number.isFinite(op.frame[1])
    );
}

export default function(table, { names, exprs, ops }, options = {}) {
  // instantiate output data
  const total = table.totalRows();
  const cols = columnSet(options.drop ? null : table);
  const data = names.map(name => cols.add(name, Array(total)));

  // analyze operations, compute non-windowed aggregates
  const [ aggOps, winOps ] = segmentOps(ops);
  const result = aggregate(table, aggOps);

  // perform table scans to generate output values
  winOps.length
    ? window(table, data, exprs, toArray(result), winOps)
    : output(table, data, exprs, result);

  return table.create(cols);
}

function segmentOps(ops) {
  const aggOps = [];
  const winOps = [];

  for (const key in ops) {
    const op = ops[key];
    op.id = key;
    (isWindowed(op) ? winOps : aggOps).push(op);
  }

  return [aggOps, winOps];
}

function output(table, data, exprs, result = {}) {
  const groups = table.groups();
  const n = data.length;

  if (groups) {
    const { keys } = groups;
    for (let i = 0; i < n; ++i) {
      const get = exprs[i];
      const col = data[i];
      table.scan((row, d) => col[row] = get(row, d, result[keys[row]]));
    }
  } else {
    for (let i = 0; i < n; ++i) {
      const get = exprs[i];
      const col = data[i];
      table.scan((row, d) => col[row] = get(row, d, result));
    }
  }
}
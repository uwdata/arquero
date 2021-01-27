import { window } from './window/window';
import { aggregate } from './reduce/util';
import { isWindow } from '../op';
import columnSet from '../table/column-set';

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
    ? window(table, data, exprs, table.isGrouped() ? result : [result], winOps)
    : output(table, data, exprs, result);

  return table.create(cols);
}

function segmentOps(ops) {
  const aggOps = [];
  const winOps = [];
  const n = ops.length;

  for (let i = 0; i < n; ++i) {
    const op = ops[i];
    op.id = i;
    (isWindowed(op) ? winOps : aggOps).push(op);
  }

  return [aggOps, winOps];
}

function output(table, cols, exprs, result = {}) {
  const groups = table.groups();
  const bits = table.mask();
  const data = table.data();
  const n = table.totalRows();
  const m = cols.length;

  if (groups) {
    const { keys } = groups;
    for (let j = 0; j < m; ++j) {
      const get = exprs[j];
      const col = cols[j];

      // inline the following for performance:
      // table.scan((row, d) => col[row] = get(row, d, result[keys[row]]));
      if (bits) {
        for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
          col[i] = get(i, data, result[keys[i]]);
        }
      } else {
        for (let i = 0; i < n; ++i) {
          col[i] = get(i, data, result[keys[i]]);
        }
      }
    }
  } else {
    for (let j = 0; j < m; ++j) {
      const get = exprs[j];
      const col = cols[j];

      // inline the following for performance:
      // table.scan((row, d) => col[row] = get(row, d, result));
      if (bits) {
        for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
          col[i] = get(i, data, result);
        }
      } else {
        for (let i = 0; i < n; ++i) {
          col[i] = get(i, data, result);
        }
      }
    }
  }
}
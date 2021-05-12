import { window } from './window/window';
import { aggregate } from './reduce/util';
import { hasWindow } from '../op';
import columnSet from '../table/column-set';
import repeat from '../util/repeat';

function isWindowed(op) {
  return hasWindow(op.name) ||
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

  const size = table.isGrouped() ? table.groups().size : 1;
  const result = aggregate(
    table, aggOps,
    repeat(ops.length, () => Array(size))
  );

  // perform table scans to generate output values
  winOps.length
    ? window(table, data, exprs, result, winOps)
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

function output(table, cols, exprs, result) {
  const bits = table.mask();
  const data = table.data();
  const { keys } = table.groups() || {};
  const op = keys
    ? (id, row) => result[id][keys[row]]
    : id => result[id][0];

  const m = cols.length;
  for (let j = 0; j < m; ++j) {
    const get = exprs[j];
    const col = cols[j];

    // inline the following for performance:
    // table.scan((i, data) => col[i] = get(i, data, op));
    if (bits) {
      for (let i = bits.next(0); i >= 0; i = bits.next(i + 1)) {
        col[i] = get(i, data, op);
      }
    } else {
      const n = table.totalRows();
      for (let i = 0; i < n; ++i) {
        col[i] = get(i, data, op);
      }
    }
  }
}
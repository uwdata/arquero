import { window } from './window/window';
import { aggregate } from './reduce/util';
import { isWindow } from '../op';

function isWindowed(op) {
  return isWindow(op.name) ||
    op.frame && (
      Number.isFinite(op.frame[0]) ||
      Number.isFinite(op.frame[1])
    );
}

export default function(table, { values, ops }) {
  // instantiate output data
  const total = table.totalRows();
  const data = { ...table.columns() };
  for (const name in values) {
    data[name] = Array(total);
  }

  // analyze operations, compute non-windowed aggregates
  const [ aggOps, winOps ] = segmentOps(ops);
  const result = aggregate(table, aggOps);

  // perform table scans to generate output values
  winOps.length
    ? window(table, data, values, result, winOps)
    : output(table, data, values, result);

  return table.create({ data });
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

function output(table, data, values, result = {}) {
  const groups = table.groups();

  if (groups) {
    const { keys } = groups;
    for (const name in values) {
      const get = values[name];
      const col = data[name];
      table.scan((row, d) => col[row] = get(row, d, result[keys[row]]));
    }
  } else {
    for (const name in values) {
      const get = values[name];
      const col = data[name];
      table.scan((row, d) => col[row] = get(row, d, result));
    }
  }
}
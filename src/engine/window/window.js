import { reducers } from '../reduce/util';
import { getWindow, isAggregate } from '../../op';
import concat from '../../util/concat';
import unroll2 from '../../util/unroll2';
import windowState from './window-state';

const frameValue = op =>
  (op.frame || [null, null]).map(v => Number.isFinite(v) ? v : null);

const peersValue = op => !!op.peers;

function windowOp(spec) {
  const { id, name, fields = [], params = [] } = spec;
  const op = getWindow(name).create(...params);
  if (fields.length) op.get = fields[0];
  op.name = id;
  return op;
}

export function window(table, output, exprs, results = [], ops) {
  // instantiate window states
  const input = table.data();
  const states = windowStates(ops, input);
  const nstate = states.length;

  const write = unroll2(
    output, exprs,
    ['r', 'input', 'result'],
    '{' + concat(output, (_, i) => `_${i}[r] = $${i}(r, input, result);`) + '}'
  );

  // scan each ordered partition
  table.partitions().forEach((rows, partitionIndex) => {
    const size = rows.length;
    const peers = windowPeers(table, rows);
    const result = results[partitionIndex] || {};

    // initialize window states
    for (let i = 0; i < nstate; ++i) {
      states[i].init(rows, peers, result);
    }

    // calculate window values per-row
    for (let index = 0; index < size; ++index) {
      // advance window frame, updates result object
      for (let i = 0; i < nstate; ++i) {
        states[i].step(index);
      }
      write(rows[index], input, result);
    }
  });
}

function windowStates(ops, data) {
  const map = {};

  // group operations by window frame parameters
  ops.forEach(op => {
    const frame = frameValue(op);
    const peers = peersValue(op);
    const key = `${frame},${peers}`;
    const { aggOps, winOps } = map[key] || (map[key] = {
      frame,
      peers,
      aggOps: [],
      winOps: []
    });
    isAggregate(op.name)
      ? aggOps.push(op)
      : winOps.push(windowOp(op));
  });

  return Object.values(map).map(_ =>
    windowState(data, _.frame, _.peers, _.winOps, reducers(_.aggOps, true)
  ));
}

function windowPeers(table, rows) {
  if (table.isOrdered()) {
    // generate peer ids for sort equality checking
    const compare = table.comparator();
    const data = table.data();
    const nrows = rows.length;
    const peers = new Uint32Array(nrows);
    for (let i = 1, index = 0; i < nrows; ++i) {
      peers[i] = compare(rows[i - 1], rows[i], data) ? ++index : index;
    }
    return peers;
  } else {
    // no sort, no peers: reuse row indices as peer ids
    return rows;
  }
}
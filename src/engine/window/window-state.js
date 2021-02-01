import ascending from '../../util/ascending';
import bisector from '../../util/bisector';
import concat from '../../util/concat';
import unroll from '../../util/unroll';

const bisect = bisector(ascending);

export default function(data, frame, adjust, ops, aggrs) {
  let rows, peer, cells, result, key;
  const isPeer = index => peer[index - 1] === peer[index];
  const numOps = ops.length;
  const numAgg = aggrs.length;

  const evaluate = ops.length
    ? unroll(
        ['w', 'r', 'k'],
        '{' + concat(ops, (_, i) => `r[_${i}.id][k]=_${i}.value(w,_${i}.get);`) + '}',
        ops
      )
    : () => {};

  const w = {
    i0: 0,
    i1: 0,
    index: 0,
    size: 0,
    peer: isPeer,

    init(partition, peers, results, group) {
      w.index = w.i0 = w.i1 = 0;
      w.size = peers.length;
      rows = partition;
      peer = peers;
      result = results;
      key = group;

      // initialize aggregates
      cells = aggrs ? aggrs.map(aggr => aggr.init()) : null;

      // initialize window ops
      for (let i = 0; i < numOps; ++i) {
        ops[i].init();
      }

      return w;
    },

    value(index, get) {
      return get(rows[index], data);
    },

    step(idx) {
      const [f0, f1] = frame;
      const n = w.size;
      const p0 = w.i0;
      const p1 = w.i1;

      w.i0 = f0 != null ? Math.max(0, idx - Math.abs(f0)) : 0;
      w.i1 = f1 != null ? Math.min(n, idx + Math.abs(f1) + 1) : n;
      w.index = idx;

      if (adjust) {
        if (w.i0 > 0 && isPeer(w.i0)) {
          w.i0 = bisect.left(peer, peer[w.i0]);
        }
        if (w.i1 < n && isPeer(w.i1)) {
          w.i1 = bisect.right(peer, peer[w.i1 - 1]);
        }
      }

      // evaluate aggregates
      for (let i = 0; i < numAgg; ++i) {
        const aggr = aggrs[i];
        const cell = cells[i];
        for (let j = p0; j < w.i0; ++j) {
          aggr.rem(cell, rows[j], data);
        }
        for (let j = p1; j < w.i1; ++j) {
          aggr.add(cell, rows[j], data);
        }
        aggr.write(cell, result, key);
      }

      // evaluate window ops
      evaluate(w, result, key);

      return result;
    }
  };

  return w;
}
import sample from '../util/sample';
import _shuffle from '../util/shuffle';

export default function(table, size, weight, options = {}) {
  const { replace, shuffle } = options;
  const parts = table.partitions(false);

  let total = 0;
  size = parts.map((idx, group) => {
    let s = size(group);
    total += (s = (replace ? s : Math.min(idx.length, s)));
    return s;
  });

  const samples = new Uint32Array(total);
  let curr = 0;

  parts.forEach((idx, group) => {
    const sz = size[group];
    const buf = samples.subarray(curr, curr += sz);

    if (!replace && sz === idx.length) {
      // sample size === data size, no replacement
      // no need to sample, just copy indices
      buf.set(idx);
    } else {
      sample(buf, replace, idx, weight);
    }
  });

  if (shuffle !== false && (parts.length > 1 || !replace)) {
    // sampling with replacement methods shuffle, so in
    // that case a single partition is already good to go
    _shuffle(samples);
  }

  return table.reify(samples);
}
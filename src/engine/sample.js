import sample from '../util/sample';

export default function(table, size, weight, options = {}) {
  const replace = !!options.replace;
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

  return table.reify(samples);
}
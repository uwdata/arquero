import sample from '../util/sample';

export default function(table, size, weight, options = {}) {
  const replace = !!options.replace;
  const parts = table.partitions();

  let total = 0;
  size = parts.map((idx, group) => {
    let s = size(group);
    total += (s = replace ? s : Math.min(idx.length, s));
    return s;
  });

  const samples = new Uint32Array(total);
  let curr = 0;

  parts.forEach((idx, group) => {
    const sz = size[group];
    const buf = samples.subarray(curr, curr += sz);

    if (!replace && sz === idx.length) {
      // sample size === data size, no replacement
      for (let i = 0; i < sz; ++i) {
        buf[i] = idx[i]; // simply copy indices
      }
    } else {
      sample(buf, replace, idx, weight);
    }
  });

  return table.reify(samples);
}
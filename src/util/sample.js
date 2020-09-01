import ascending from './ascending';
import bisector from './bisector';
import { random } from './random';

export default function(size, replace, index, weight) {
  return (
    replace
      ? (weight ? sampleRW : sampleRU)
      : (weight ? sampleNW : sampleNU)
  )(size, index, weight);
}

// uniform sampling with replacement
// uses straightforward uniform sampling
function sampleRU(size, index) {
  const n = index.length;
  const sample = new Uint32Array(size);
  for (let i = 0; i < size; ++i) {
    sample[i] = index[(n * random()) | 0];
  }
  return sample;
}

// weighted sampling with replacement
// uses binary search lookup against cumulative weight
function sampleRW(size, index, weight) {
  const n = index.length;
  const w = new Float64Array(n);

  let sum = 0;
  for (let i = 0; i < n; ++i) {
    w[i] = (sum += weight(index[i]));
  }

  const sample = new Uint32Array(size);
  const bisect = bisector(ascending).right;
  for (let i = 0; i < size; ++i) {
    sample[i] = index[bisect(w, sum * random())];
  }
  return sample;
}

// uniform sampling without replacement
// uses reservoir sampling to build out the sample
// https://en.wikipedia.org/wiki/Reservoir_sampling
function sampleNU(size, index) {
  const n = index.length;
  if (size >= n) return index;

  const sample = new Uint32Array(size);
  for (let i = 0; i < size; ++i) {
    sample[i] = index[i];
  }

  for (let i = size; i < n; ++i) {
    const j = i * random();
    if (j < size) {
      sample[j | 0] = index[i];
    }
  }

  return sample;
}

// weighted sample without replacement
// uses method of Efraimidis and Spirakis
// TODO: could use min-heap to improve efficiency
function sampleNW(size, index, weight) {
  const n = index.length;
  if (size >= n) return index;

  const w = new Float32Array(n);
  const k = new Uint32Array(n);
  for (let i = 0; i < n; ++i) {
    k[i] = i;
    w[i] = -Math.log(random()) / weight(index[i]);
  }

  k.sort((a, b) => w[a] - w[b]);
  return k.slice(0, size).map(i => index[i]);
}
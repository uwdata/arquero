import ascending from './ascending';
import bisector from './bisector';
import { random } from './random';

export default function(buffer, replace, index, weight) {
  return (
    replace
      ? (weight ? sampleRW : sampleRU)
      : (weight ? sampleNW : sampleNU)
  )(buffer.length, buffer, index, weight);
}

// uniform sampling with replacement
// uses straightforward uniform sampling
function sampleRU(size, buffer, index) {
  const n = index.length;
  for (let i = 0; i < size; ++i) {
    buffer[i] = index[(n * random()) | 0];
  }
  return buffer;
}

// weighted sampling with replacement
// uses binary search lookup against cumulative weight
function sampleRW(size, buffer, index, weight) {
  const n = index.length;
  const w = new Float64Array(n);

  let sum = 0;
  for (let i = 0; i < n; ++i) {
    w[i] = (sum += weight(index[i]));
  }

  const bisect = bisector(ascending).right;
  for (let i = 0; i < size; ++i) {
    buffer[i] = index[bisect(w, sum * random())];
  }
  return buffer;
}

// uniform sampling without replacement
// uses reservoir sampling to build out the sample
// https://en.wikipedia.org/wiki/Reservoir_sampling
function sampleNU(size, buffer, index) {
  const n = index.length;
  if (size >= n) return index;

  for (let i = 0; i < size; ++i) {
    buffer[i] = index[i];
  }

  for (let i = size; i < n; ++i) {
    const j = i * random();
    if (j < size) {
      buffer[j | 0] = index[i];
    }
  }

  return buffer;
}

// weighted sample without replacement
// uses method of Efraimidis and Spirakis
// TODO: could use min-heap to improve efficiency
function sampleNW(size, buffer, index, weight) {
  const n = index.length;
  if (size >= n) return index;

  const w = new Float32Array(n);
  const k = new Uint32Array(n);
  for (let i = 0; i < n; ++i) {
    k[i] = i;
    w[i] = -Math.log(random()) / weight(index[i]);
  }

  k.sort((a, b) => w[a] - w[b]);
  for (let i = 0; i < size; ++i) {
    buffer[i] = index[k[i]];
  }
  return buffer;
}
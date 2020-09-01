export default function(values, start = 0, stop = values.length) {
  let max = values[start];

  for (let i = start; i < stop; ++i) {
    if (max < values[i]) {
      max = values[i];
    }
  }

  return max;
}
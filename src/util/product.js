export default function(values, start = 0, stop = values.length) {
  let prod = values[start++];

  for (let i = start; i < stop; ++i) {
    prod *= values[i];
  }

  return prod;
}
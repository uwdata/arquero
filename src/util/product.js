export default function(values, start = 0, stop = values.length) {
  let prod = 1;

  for (let i = start; i < stop; ++i) {
    prod *= values[i];
  }

  return prod;
}
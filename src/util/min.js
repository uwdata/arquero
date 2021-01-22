import NULL from './null';

export default function(values, start = 0, stop = values.length) {
  let min = stop ? values[start++] : NULL;

  for (let i = start; i < stop; ++i) {
    if (min > values[i]) {
      min = values[i];
    }
  }

  return min;
}
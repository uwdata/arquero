export default function quantile(values, p) {
  const n = values.length;

  if (!n) return;
  if ((p = +p) <= 0 || n < 2) return +values[0];
  if (p >= 1) return +values[n - 1];

  const i = (n - 1) * p;
  const i0 = Math.floor(i);
  const v0 = +values[i0];
  const v1 = +values[i0 + 1];
  return v0 + (v1 - v0) * (i - i0);
}
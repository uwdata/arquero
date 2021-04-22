export default function(min, max, maxbins = 15, nice = true, minstep = 0, step) {
  const base = 10;
  const logb = Math.LN10;

  if (step == null) {
    const level = Math.ceil(Math.log(maxbins) / logb);
    const span = (max - min) || Math.abs(min) || 1;
    const div = [5, 2];

    step = Math.max(
      minstep,
      Math.pow(base, Math.round(Math.log(span) / logb) - level)
    );

    // increase step size if too many bins
    while (Math.ceil(span / step) > maxbins) {
      step *= base;
    }

    // decrease step size if it stays within maxbins
    const n = div.length;
    for (let i = 0; i < n; ++i) {
      const v = step / div[i];
      if (v >= minstep && span / v <= maxbins) {
        step = v;
      }
    }
  }

  // snap to "nice" boundaries
  if (nice) {
    let v = Math.log(step);
    const precision = v >= 0 ? 0 : ~~(-v / logb) + 1;
    const eps = Math.pow(base, -precision - 1);
    v = Math.floor(min / step + eps) * step;
    min = min < v ? v - step : v;
    max = Math.ceil(max / step) * step;
  }

  return [
    min,
    max === min ? min + step : max,
    step
  ];
}
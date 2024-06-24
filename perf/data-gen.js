export function rint(min, max) {
  let delta = min;
  if (max === undefined) {
    min = 0;
  } else {
    delta = max - min;
  }
  return (min + delta * Math.random()) | 0;
}

export function ints(n, min, max, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf ? null : rint(min, max);
    data.push(v);
  }
  return data;
}

export function floats(n, min, max, nullf) {
  const data = [];
  const delta = max - min;
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : (min + delta * Math.random());
    data.push(v);
  }
  return data;
}

export function dates(n, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : new Date(1970 + rint(0, 41), 0, rint(1, 366));
    data.push(v);
  }
  return data;
}

export function strings(n) {
  const c = 'bcdfghjlmpqrstvwxyz';
  const v = 'aeiou';
  const cn = c.length;
  const vn = v.length;
  const data = [];
  const map = {};
  while (data.length < n) {
    const s = c[rint(cn)] + v[rint(vn)] + c[rint(cn)] + c[rint(cn)];
    if (!map[s]) {
      data.push(s);
      map[s] = 1;
    }
  }
  return data;
}

export function bools(n, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf ? null : (Math.random() < 0.5);
    data.push(v);
  }
  return data;
}

export function sample(n, values, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : values[~~(values.length * Math.random())];
    data.push(v);
  }
  return data;
}

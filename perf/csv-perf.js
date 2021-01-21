const tape = require('tape');
const { fromCSV, table } = require('..');

function rint(min, max) {
  let delta = min;
  if (max === undefined) {
    min = 0;
  } else {
    delta = max - min;
  }
  return (min + delta * Math.random()) | 0;
}

function ints(n, min, max, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf ? null : rint(min, max);
    data.push(v);
  }
  return data;
}

function floats(n, min, max, nullf) {
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

function dates(n, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : new Date(1970 + rint(0, 41), 0, rint(1, 366));
    data.push(v);
  }
  return data;
}

function sample(n, values, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf
      ? null
      : values[~~(values.length * Math.random())];
    data.push(v);
  }
  return data;
}

function strings(n) {
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

function bools(n, nullf) {
  const data = [];
  for (let i = 0; i < n; ++i) {
    const v = nullf && Math.random() < nullf ? null : (Math.random() < 0.5);
    data.push(v);
  }
  return data;
}

function toCSV(...values) {
  const cols = values.map((v, i) => [`col${i}`, v]);
  return table(cols).toCSV();
}

function parse(csv, opt) {
  const t0 = Date.now();
  const tt = (fromCSV(csv, opt), Date.now() - t0);
  return tt;
}

function run(N, nulls, msg) {
  const opt = {
    parse: [0,1,2,3,4].reduce((p, i) => (p[`col${i}`] = x => x, p), {})
  };
  const bv = bools(N, nulls);
  const iv = ints(N, -10000, 10000, nulls);
  const fv = floats(N, -10000, 10000, nulls);
  const dv = dates(N, nulls);
  const sv = sample(N, strings(100), nulls);
  const av = [bv, iv, fv, dv, sv];

  tape(`parse csv: ${msg}`, t => {
    console.table([ // eslint-disable-line
      { type: 'boolean', raw: parse(toCSV(bv), opt), typed: parse(toCSV(bv)) },
      { type: 'integer', raw: parse(toCSV(iv), opt), typed: parse(toCSV(iv)) },
      { type: 'float',   raw: parse(toCSV(fv), opt), typed: parse(toCSV(fv)) },
      { type: 'date',    raw: parse(toCSV(dv), opt), typed: parse(toCSV(dv)) },
      { type: 'string',  raw: parse(toCSV(sv), opt), typed: parse(toCSV(sv)) },
      { type: 'all',     raw: parse(toCSV(...av), opt), typed: parse(toCSV(...av)) }
    ]);
    t.end();
  });
}

run(1e5, 0, '100k values');
run(1e5, 0.05, '100k values, 5% nulls');
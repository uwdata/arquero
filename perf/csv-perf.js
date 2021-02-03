const tape = require('tape');
const time = require('./time');
const { bools, dates, floats, ints, sample, strings } = require('./data-gen');
const { fromCSV, table } = require('..');

function toCSV(...values) {
  const cols = values.map((v, i) => [`col${i}`, v]);
  return table(cols).toCSV();
}

function parse(csv, opt) {
  return time(() => fromCSV(csv, opt));
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
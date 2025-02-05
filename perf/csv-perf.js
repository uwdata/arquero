import tape from 'tape';
import { time } from './time.js';
import { bools, dates, floats, ints, sample, strings } from './data-gen.js';
import { toCSV as _toCSV, fromCSV, table } from '../src/index.js';

function toCSV(...values) {
  const cols = values.map((v, i) => [`col${i}`, v]);
  return _toCSV(table(cols));
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

  tape(`parse csv: ${msg}`, async t => {
    console.table([ // eslint-disable-line
      { type: 'boolean', raw: await parse(toCSV(bv), opt), typed: await parse(toCSV(bv)) },
      { type: 'integer', raw: await parse(toCSV(iv), opt), typed: await parse(toCSV(iv)) },
      { type: 'float',   raw: await parse(toCSV(fv), opt), typed: await parse(toCSV(fv)) },
      { type: 'date',    raw: await parse(toCSV(dv), opt), typed: await parse(toCSV(dv)) },
      { type: 'string',  raw: await parse(toCSV(sv), opt), typed: await parse(toCSV(sv)) },
      { type: 'all',     raw: await parse(toCSV(...av), opt), typed: await parse(toCSV(...av)) }
    ]);
    t.end();
  });
}

run(1e5, 0, '100k values');
run(1e5, 0.05, '100k values, 5% nulls');

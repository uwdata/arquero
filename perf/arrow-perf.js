import tape from 'tape';
import { time } from './time.js';
import { bools, floats, ints, sample, strings } from './data-gen.js';
import { fromArrow, table, toArrow } from '../src/index.js';
import {
  Bool, Dictionary, Float64, Int32, Table, Uint32, Utf8,
  tableFromIPC, tableToIPC, vectorFromArray
} from 'apache-arrow';

function process(N, nulls, msg) {
  const vectors = {
    k: vectorFromArray(
      sample(N, strings(100), nulls),
      new Dictionary(new Utf8(), new Int32())
    ),
    v: vectorFromArray(
      ints(N, -10000, 10000, nulls),
      new Int32()
    )
    };
  const aa = new Table(vectors);
  const buf = tableToIPC(aa, 'stream');
  const ft = fromArrow(buf); // using flechette
  const at = fromArrow(aa);  // using arrow-js

  const filterDict = (dt, val) => time(() => {
    dt.filter(`d.k === '${val}'`).numRows();
  });

  const filterValue = (dt, val) => time(() => {
    dt.filter(`d.v >= ${val}`).numRows();
  });

  tape(`arrow processing: ${msg}`, t => {
    const k = aa.getChild('k').at(50);
    console.table([ // eslint-disable-line
      {
        operation:  'init table',
        'arrow-js': time(() => fromArrow(tableFromIPC(buf))),
        flechette:  time(() => fromArrow(buf))
      },
      {
        operation:  'count dictionary',
        'arrow-js': time(() => at.groupby('k').count()),
        flechette:  time(() => ft.groupby('k').count())
      },
      {
        operation:  'filter dictionary',
        'arrow-js': filterDict(at, k),
        flechette:  filterDict(ft, k)
      },
      {
        operation:  'filter numbers 0',
        'arrow-js': filterValue(at, 0),
        flechette:  filterValue(ft, 0)
      },
      {
        operation:  'filter numbers 1',
        'arrow-js': filterValue(at, 1),
        flechette:  filterValue(ft, 1)
      }
    ]);
    t.end();
  });
}

function serialize(N, nulls, msg) {
  tape(`arrow serialization: ${msg}`, t => {
    console.table([ // eslint-disable-line
      encode('boolean', new Bool(), bools(N, nulls)),
      encode('integer', new Int32(), ints(N, -10000, 10000, nulls)),
      encode('float', new Float64(), floats(N, -10000, 10000, nulls)),
      encode('dictionary',
        new Dictionary(new Utf8(), new Uint32(), 0),
        sample(N, strings(100), nulls)
      )
    ]);
    t.end();
  });
}

function encode(name, type, values) {
  const dt = table({ values });

  // measure encoding times
  const qt = time(() => tableToIPC(toArrow(dt, { types: { values: type } })));
  const at = time(
    () => tableToIPC(new Table({ values: vectorFromArray(values, type) }))
  );
  const jt = time(() => JSON.stringify(values));

  // measure serialized byte size
  const ab = tableToIPC(new Table({
    values: vectorFromArray(values, type)
  })).length;
  const qb = tableToIPC(toArrow(dt, { types: { values: type }})).length;
  const jb = (new TextEncoder().encode(JSON.stringify(values))).length;

  // check that arrow and arquero produce the same result
  if (qb !== ab) {
    // eslint-disable-next-line
    console.warn(`Arrow and Arquero bytes don't match: ${ab} vs. ${qb}`);
  }

  return {
    'data type':  name,
    'arrow-js':   at,
    'arquero':    qt,
    'json':       jt,
    'size-arrow': ab,
    'size-json':  jb
  };
}

// run arrow processing benchmarks
process(5e6, 0, '5M values, 0% nulls');
process(5e6, 0.05, '5M values, 5% nulls');

// run arrow serialization benchmarks
serialize(1e6, 0, '1M values');
serialize(1e6, 0.05, '1M values, 5% nulls');

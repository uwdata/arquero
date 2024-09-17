import tape from 'tape';
import { time } from './time.js';
import { bools, floats, ints, sample, strings } from './data-gen.js';
import { fromArrow, table, toArrowIPC } from '../src/index.js';
import { bool, columnFromArray, dictionary, float64, int32, tableFromColumns, tableToIPC, uint32, utf8 } from '@uwdata/flechette';
import { tableFromIPC } from 'apache-arrow';

function process(N, nulls, msg) {
  const aa = tableFromColumns({
    k: columnFromArray(
        sample(N, strings(100), nulls),
        dictionary(utf8(), int32())
      ),
    v: columnFromArray(
        ints(N, -10000, 10000, nulls),
        int32()
      )
  });
  const buf = tableToIPC(aa);
  const at = fromArrow(tableFromIPC(buf)); // using arrow-js
  const ft = fromArrow(aa); // using flechette

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
      encode('boolean', bool(), bools(N, nulls)),
      encode('integer', int32(), ints(N, -10000, 10000, nulls)),
      encode('float', float64(), floats(N, -10000, 10000, nulls)),
      encode('dictionary',
        dictionary(utf8(), uint32()),
        sample(N, strings(100), nulls)
      )
    ]);
    t.end();
  });
}

function encode(name, type, values) {
  const dt = table({ values });

  // measure encoding times
  const qt = time(() => toArrowIPC(dt, { types: { values: type } }));
  const at = time(
    () => tableToIPC(
      tableFromColumns({
        values: columnFromArray(values, type)
      })
    )
  );
  const jt = time(() => JSON.stringify(values));

  // measure serialized byte size
  const ab = tableToIPC(tableFromColumns({
    values: columnFromArray(values, type)
  })).length;
  const qb = toArrowIPC(dt, { types: { values: type }}).length;
  const jb = (new TextEncoder().encode(JSON.stringify(values))).length;

  // check that arrow and arquero produce the same result
  if (qb !== ab) {
    // eslint-disable-next-line
    console.warn(`Arrow and Arquero bytes don't match: ${ab} vs. ${qb}`);
  }

  return {
    'data type':  name,
    'flechette':  at,
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

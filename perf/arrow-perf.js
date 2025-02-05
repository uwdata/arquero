import tape from 'tape';
import { time } from './time.js';
import { bools, floats, ints, sample, strings } from './data-gen.js';
import { table, toArrowIPC } from '../src/index.js';
import { fromArrow } from '../src/format/from-arrow.js';
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

  tape(`arrow processing: ${msg}`, async t => {
    const k = aa.getChild('k').at(50);
    console.table([ // eslint-disable-line
      {
        operation:  'init table',
        'arrow-js': await time(() => fromArrow(tableFromIPC(buf))),
        flechette:  await time(() => fromArrow(buf))
      },
      {
        operation:  'count dictionary',
        'arrow-js': await time(() => at.groupby('k').count()),
        flechette:  await time(() => ft.groupby('k').count())
      },
      {
        operation:  'filter dictionary',
        'arrow-js': await filterDict(at, k),
        flechette:  await filterDict(ft, k)
      },
      {
        operation:  'filter numbers 0',
        'arrow-js': await filterValue(at, 0),
        flechette:  await filterValue(ft, 0)
      },
      {
        operation:  'filter numbers 1',
        'arrow-js': await filterValue(at, 1),
        flechette:  await filterValue(ft, 1)
      }
    ]);
    t.end();
  });
}

function serialize(N, nulls, msg) {
  tape(`arrow serialization: ${msg}`, async t => {
    console.table([ // eslint-disable-line
      await encode('boolean', bool(), bools(N, nulls)),
      await encode('integer', int32(), ints(N, -10000, 10000, nulls)),
      await encode('float', float64(), floats(N, -10000, 10000, nulls)),
      await encode('dictionary',
        dictionary(utf8(), uint32()),
        sample(N, strings(100), nulls)
      )
    ]);
    t.end();
  });
}

async function encode(name, type, values) {
  const dt = table({ values });

  // measure encoding times
  const qt = await time(() => toArrowIPC(dt, { types: { values: type } }));
  const at = await time(
    () => tableToIPC(
      tableFromColumns({
        values: columnFromArray(values, type)
      })
    )
  );
  const jt = await time(() => JSON.stringify(values));

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

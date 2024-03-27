import tape from 'tape';
import { readFileSync } from 'fs';
import { Int8, Type, tableFromIPC, tableToIPC, vectorFromArray } from 'apache-arrow';
import fromArrow from '../../src/format/from-arrow';
import fromCSV from '../../src/format/from-csv';
import fromJSON from '../../src/format/from-json';
import toArrow from '../../src/format/to-arrow';
import { table } from '../../src/table';

function date(year, month=0, date=1, hours=0, minutes=0, seconds=0, ms=0) {
  return new Date(year, month, date, hours, minutes, seconds, ms);
}

function utc(year, month=0, date=1, hours=0, minutes=0, seconds=0, ms=0) {
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, ms));
}

function Int8Vector(data) {
  return vectorFromArray(data, new Int8);
}

function isArrayType(value) {
  return Array.isArray(value)
    || (value && value.map === Int8Array.prototype.map);
}

function compareTables(aqt, art) {
  const err = aqt.columnNames()
    .map(name => compareColumns(name, aqt, art))
    .filter(a => a.length);
  return err.length;
}

function compareColumns(name, aqt, art) {
  const normalize = v => v === undefined ? null : v instanceof Date ? +v : v;
  const idx = aqt.indices();
  const aqc = aqt.column(name);
  const arc = art.getChild(name);
  const err = [];
  for (let i = 0; i < idx.length; ++i) {
    let v1 = normalize(aqc.get(idx[i]));
    let v2 = normalize(arc.get(i));
    if (isArrayType(v1)) {
      v1 = v1.join();
      v2 = [...v2].join();
    } else if (typeof v1 === 'object') {
      v1 = JSON.stringify(v1);
      v2 = JSON.stringify(v2);
    }
    if (v1 !== v2) {
      err.push({ name, index: i, v1, v2 });
    }
  }
  return err;
}

tape('toArrow produces Arrow data for an input table', t => {
  const dt = table({
    i: [1, 2, 3, undefined, 4, 5],
    f: Float32Array.from([1.2, 2.3, 3.0, 3.4, null, 4.5]),
    n: [4.5, 4.4, 3.4, 3.0, 2.3, 1.2],
    b: [true, true, false, true, null, false],
    s: ['foo', null, 'bar', 'baz', 'baz', 'bar'],
    d: [date(2000,0,1), date(2000,1,2), null, date(2010,6,9), date(2018,0,1), date(2020,10,3)],
    u: [utc(2000,0,1), utc(2000,1,2), null, utc(2010,6,9), utc(2018,0,1), utc(2020,10,3)],
    e: [null, null, null, null, null, null],
    v: Int8Vector([10, 9, 8, 7, 6, 5]),
    a: [[1, null, 3], [4, 5], null, [6, 7], [8, 9], []],
    l: [[1], [2], [3], [4], [5], [6]],
    o: [1, 2, 3, null, 5, 6].map(v => v ? { key: v } : null)
  });

  const at = dt.toArrow();

  t.equal(
    compareTables(dt, at), 0,
    'arquero and arrow tables match'
  );

  t.equal(
    compareTables(dt, toArrow(dt.objects())), 0,
    'object array and arrow tables match'
  );

  const buffer = tableToIPC(at);
  const bt = tableFromIPC(buffer);

  t.equal(
    compareTables(dt, bt), 0,
    'arquero and serialized arrow tables match'
  );

  t.equal(
    compareTables(fromArrow(bt), at), 0,
    'serialized arquero and arrow tables match'
  );

  t.end();
});

tape('toArrow produces Arrow data for an input CSV', async t => {
  const dt = fromCSV(readFileSync('test/format/data/beers.csv', 'utf8'));
  const st = dt.derive({ name: d => d.name + '' });
  const at = dt.toArrow();

  t.equal(
    compareTables(st, at), 0,
    'arquero and arrow tables match'
  );

  t.equal(
    compareTables(st, toArrow(st.objects())), 0,
    'object array and arrow tables match'
  );

  const buffer = tableToIPC(at);

  t.equal(
    compareTables(st, tableFromIPC(buffer)), 0,
    'arquero and serialized arrow tables match'
  );

  t.equal(
    compareTables(fromArrow(tableFromIPC(buffer)), at), 0,
    'serialized arquero and arrow tables match'
  );

  t.end();
});

tape('toArrow handles ambiguously typed data', async t => {
  const at = table({ x: [1, 2, 3, 'foo'] }).toArrow();
  t.deepEqual(
    [...at.getChild('x')],
    ['1', '2', '3', 'foo'],
    'fallback to string type if a string is observed'
  );

  t.throws(
    () => table({ x: [1, 2, 3, true] }).toArrow(),
    'fail on mixed types'
  );

  t.end();
});

tape('toArrow result produces serialized arrow data', t => {
  const dt = fromCSV(readFileSync('test/format/data/beers.csv', 'utf8'))
    .derive({ name: d => d.name + '' });

  const json = dt.toJSON();
  const jt = fromJSON(json);

  const bytes = tableToIPC(dt.toArrow());
  const bt = fromArrow(tableFromIPC(bytes));

  t.deepEqual(
    [bt.toJSON(), jt.toJSON()],
    [json, json],
    'arrow and json round trips match'
  );

  t.end();
});

tape('toArrow respects columns option', t => {
  const dt = table({
    w: ['a', 'b', 'a'],
    x: [1, 2, 3],
    y: [1.6181, 2.7182, 3.1415],
    z: [true, true, false]
  });

  const at = dt.toArrow({ columns: ['w', 'y'] });

  t.deepEqual(
    at.schema.fields.map(f => f.name),
    ['w', 'y'],
    'column subset'
  );

  t.end();
});

tape('toArrow respects limit and offset options', t => {
  const dt = table({
    w: ['a', 'b', 'a'],
    x: [1, 2, 3],
    y: [1.6181, 2.7182, 3.1415],
    z: [true, true, false]
  });

  t.equal(
    JSON.stringify([...dt.toArrow({ limit: 2 })]),
    '[{"w":"a","x":1,"y":1.6181,"z":true},{"w":"b","x":2,"y":2.7182,"z":true}]',
    'limit'
  );
  t.equal(
    JSON.stringify([...dt.toArrow({ offset: 1 })]),
    '[{"w":"b","x":2,"y":2.7182,"z":true},{"w":"a","x":3,"y":3.1415,"z":false}]',
    'offset'
  );
  t.equal(
    JSON.stringify([...dt.toArrow({ offset: 1, limit: 1 })]),
    '[{"w":"b","x":2,"y":2.7182,"z":true}]',
    'limit and offset'
  );

  t.end();
});

tape('toArrow respects limit and types option', t => {
  const dt = table({
    w: ['a', 'b', 'a'],
    x: [1, 2, 3],
    y: [1.6181, 2.7182, 3.1415],
    z: [true, true, false]
  });

  const at = dt.toArrow({
    types: { w: Type.Utf8, x: Type.Int32, y: Type.Float32 }
  });

  const types = ['w', 'x', 'y', 'z'].map(name => at.getChild(name).type);

  t.deepEqual(
    types.map(t => t.typeId),
    [Type.Utf8, Type.Int, Type.Float, Type.Bool],
    'type ids match'
  );
  t.equal(types[1].bitWidth, 32, 'int32');
  t.equal(types[2].precision, 1, 'float32');

  t.end();
});

tape('toArrowBuffer generates the correct output for file option', (t) => {
  const dt = table({
    w: ['a', 'b', 'a'],
    x: [1, 2, 3],
    y: [1.6181, 2.7182, 3.1415],
    z: [true, true, false]
  });

  const buffer = dt.toArrowBuffer({ format: 'file' });

  t.deepEqual(
    buffer.slice(0, 8),
    new Uint8Array([65, 82, 82, 79, 87, 49, 0, 0])
  );
  t.end();
});

tape('toArrowBuffer generates the correct output for stream option', (t) => {
  const dt = table({
    w: ['a', 'b', 'a'],
    x: [1, 2, 3],
    y: [1.6181, 2.7182, 3.1415],
    z: [true, true, false]
  });

  const buffer = dt.toArrowBuffer({ format: 'stream' });

  t.deepEqual(
    buffer.slice(0, 8),
    new Uint8Array([255, 255, 255, 255, 88, 1, 0, 0])
  );
  t.end();
});

tape('toArrowBuffer defaults to using stream option', (t) => {
  const dt = table({
    w: ['a', 'b', 'a'],
    x: [1, 2, 3],
    y: [1.6181, 2.7182, 3.1415],
    z: [true, true, false]
  });

  const buffer = dt.toArrowBuffer();

  t.deepEqual(
    buffer.slice(0, 8),
    new Uint8Array([255, 255, 255, 255, 88, 1, 0, 0])
  );
  t.end();
});

tape(
  'toArrowBuffer throws an error if the format is not stream or file',
  (t) => {
    t.throws(() => {
      const dt = table({
        w: ['a', 'b', 'a'],
        x: [1, 2, 3],
        y: [1.6181, 2.7182, 3.1415],
        z: [true, true, false]
      });

      dt.toArrowBuffer({ format: 'nonsense' });
    }, 'Unrecognised output format');
    t.end();
  }
);

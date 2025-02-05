import assert from 'node:assert';
import {
  Type, bool, columnFromArray, dateDay, dateMillisecond, dictionary,
  fixedSizeList, float32, float64, int16, int32, int64, int8, list, struct,
  tableFromColumns, tableFromIPC, tableToIPC, uint16, uint32, uint64, uint8,
  utf8
} from '@uwdata/flechette';
import {
  fromArrow, fromJSON, loadCSV, table, toArrow, toJSON
} from '../../src/index.js';

function date(year, month=0, date=1, hours=0, minutes=0, seconds=0, ms=0) {
  return new Date(year, month, date, hours, minutes, seconds, ms);
}

function utc(year, month=0, date=1, hours=0, minutes=0, seconds=0, ms=0) {
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, ms));
}

function Int8Column(data) {
  return columnFromArray(data, int8());
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
    let v1 = normalize(aqc.at(idx[i]));
    let v2 = normalize(arc.at(i));
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

function columnFromTable(table, name, type) {
  const at = toArrow(table, { types: { [name]: type } });
  return at.getChild(name);
}

function integerTest(type) {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  valueTest(type, values, ', without nulls');
  valueTest(type, [null, ...values, null], ', with nulls');
}

function floatTest(type) {
  const values = [0, NaN, 1/3, Math.PI, 7, Infinity, -Infinity];
  valueTest(type, values, ', without nulls');
  valueTest(type, [null, ...values, null], ', with nulls');
}

function bigintTest(type) {
  const values = [0n, 1n, 10n, 100n, 1000n, 10n ** 10n];
  valueTest(type, values, ', without nulls');
  valueTest(type, [null, ...values, null], ', with nulls');
}

function dateTest(type) {
  const date = (y, m = 0, d = 1) => new Date(Date.UTC(y, m, d));
  const values = [
    date(2000, 0, 1),
    date(2004, 10, 12),
    date(2007, 3, 14),
    date(2009, 6, 26),
    date(2000, 0, 1),
    date(2004, 10, 12),
    date(2007, 3, 14),
    date(2009, 6, 26),
    date(2000, 0, 1),
    date(2004, 10, 12)
  ];
  valueTest(type, values, ', without nulls');
  valueTest(type, [null, ...values, null], ', with nulls');
}

function valueTest(type, values, msg) {
  const dt = table({ values });
  const u = columnFromTable(dt, 'values', type);
  const v = columnFromArray(values, type);
  const tu = tableFromColumns({ values: u });
  const tv = tableFromColumns({ values: v });

  assert.equal(
    tableToIPC(tu).join(' '),
    tableToIPC(tv).join(' '),
    'serialized data matches' + msg
  );
}

describe('toArrow', () => {
  it('produces Arrow data for an input table', async () => {
    const dt = table({
      i: [1, 2, 3, undefined, 4, 5],
      f: Float32Array.from([1.2, 2.3, 3.0, 3.4, -1.3, 4.5]),
      n: [4.5, 4.4, 3.4, 3.0, 2.3, 1.2],
      b: [true, true, false, true, null, false],
      s: ['foo', null, 'bar', 'baz', 'baz', 'bar'],
      d: [date(2000,0,1), date(2000,1,2), null, date(2010,6,9), date(2018,0,1), date(2020,10,3)],
      u: [utc(2000,0,1), utc(2000,1,2), null, utc(2010,6,9), utc(2018,0,1), utc(2020,10,3)],
      e: [null, null, null, null, null, null],
      v: Int8Column([10, 9, 8, 7, 6, 5]),
      a: [[1, null, 3], [4, 5], null, [6, 7], [8, 9], []],
      l: [[1], [2], [3], [4], [5], [6]],
      o: [1, 2, 3, null, 5, 6].map(v => v ? { key: v } : null)
    });

    const at = toArrow(dt);

    assert.equal(
      compareTables(dt, at), 0,
      'arquero and arrow tables match'
    );

    const buffer = tableToIPC(at);
    const bt = tableFromIPC(buffer);

    assert.equal(
      compareTables(dt, bt), 0,
      'arquero and serialized arrow tables match'
    );

    assert.equal(
      compareTables(fromArrow(bt), at), 0,
      'serialized arquero and arrow tables match'
    );
  });

  it('produces Arrow data for an input CSV', async () => {
    const dt = await loadCSV('test/format/data/beers.csv');
    const st = dt.derive({ name: d => d.name + '' });
    const at = toArrow(dt);

    assert.equal(
      compareTables(st, at), 0,
      'arquero and arrow tables match'
    );

    const buffer = tableToIPC(at);

    assert.equal(
      compareTables(st, tableFromIPC(buffer)), 0,
      'arquero and serialized arrow tables match'
    );

    assert.equal(
      compareTables(fromArrow(tableFromIPC(buffer)), at), 0,
      'serialized arquero and arrow tables match'
    );
  });

  it('produces Arrow data from mixed inputs', () => {
    const dt0 = table({
      i: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      f: Float32Array.from([1.2, 2.3, 3.0, 3.4, 4.5, 5.4, 6.5, 7.6, 8.7, 9.2])
    });

    // create an arrow table with multiple record batches
    // then derive a new table
    const at0 = toArrow(dt0, { maxBatchRows: 4 });
    const dt = fromArrow(at0).derive({ sum: d => d.i + d.f });
    const at = toArrow(dt);

    assert.equal(
      compareTables(dt, at), 0,
      'arquero and arrow tables match'
    );

    const buffer = tableToIPC(at);
    const bt = tableFromIPC(buffer);

    assert.equal(
      compareTables(dt, bt), 0,
      'arquero and serialized arrow tables match'
    );

    assert.equal(
      compareTables(fromArrow(bt), at), 0,
      'serialized arquero and arrow tables match'
    );
  });

  it('produces Arrow data from filtered mixed inputs', () => {
    const dt0 = table({
      i: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      f: Float32Array.from([1.2, 2.3, 3.0, 3.4, 4.5, 5.4, 6.5, 7.6, 8.7, 9.2])
    });

    // create an arrow table with multiple record batches
    // then derive a new table
    const at0 = toArrow(dt0, { maxBatchRows: 4 });
    const dt = fromArrow(at0)
      .derive({ sum: d => d.i + d.f })
      .filter(d => d.i % 2 === 0);
    const at = toArrow(dt);

    assert.equal(
      compareTables(dt, at), 0,
      'arquero and arrow tables match'
    );

    const buffer = tableToIPC(at);
    const bt = tableFromIPC(buffer);

    assert.equal(
      compareTables(dt, bt), 0,
      'arquero and serialized arrow tables match'
    );

    assert.equal(
      compareTables(fromArrow(bt), at), 0,
      'serialized arquero and arrow tables match'
    );
  });

  it('throws on ambiguously typed data', async () => {
    assert.throws(
      () => toArrow(table({ x: [1, 2, 3, 'foo'] })),
      'fail on mixed types'
    );

    assert.throws(
      () => toArrow(table({ x: [1, 2, 3, true] })),
      'fail on mixed types'
    );
  });

  it('result produces serialized arrow data', async () => {
    const dt = (await loadCSV('test/format/data/beers.csv'))
      .derive({ name: d => d.name + '' });

    const json = toJSON(dt);
    const jt = fromJSON(json);

    const bytes = tableToIPC(toArrow(dt));
    const bt = fromArrow(tableFromIPC(bytes));

    assert.deepEqual(
      [toJSON(bt), toJSON(jt)],
      [json, json],
      'arrow and json round trips match'
    );
  });

  it('respects columns option', () => {
    const dt = table({
      w: ['a', 'b', 'a'],
      x: [1, 2, 3],
      y: [1.6181, 2.7182, 3.1415],
      z: [true, true, false]
    });

    const at = toArrow(dt, { columns: ['w', 'y'] });

    assert.deepEqual(
      at.schema.fields.map(f => f.name),
      ['w', 'y'],
      'column subset'
    );
  });

  it('respects limit and offset options', () => {
    const dt = table({
      w: ['a', 'b', 'a'],
      x: [1, 2, 3],
      y: [1.6181, 2.7182, 3.1415],
      z: [true, true, false]
    });

    assert.equal(
      JSON.stringify([...toArrow(dt, { limit: 2 })]),
      '[{"w":"a","x":1,"y":1.6181,"z":true},{"w":"b","x":2,"y":2.7182,"z":true}]',
      'limit'
    );
    assert.equal(
      JSON.stringify([...toArrow(dt, { offset: 1 })]),
      '[{"w":"b","x":2,"y":2.7182,"z":true},{"w":"a","x":3,"y":3.1415,"z":false}]',
      'offset'
    );
    assert.equal(
      JSON.stringify([...toArrow(dt, { offset: 1, limit: 1 })]),
      '[{"w":"b","x":2,"y":2.7182,"z":true}]',
      'limit and offset'
    );
  });

  it('respects limit and types option', () => {
    const dt = table({
      w: ['a', 'b', 'a'],
      x: [1, 2, 3],
      y: [1.6181, 2.7182, 3.1415],
      z: [true, true, false]
    });

    const at = toArrow(dt, {
      types: { w: utf8(), x: int32(), y: float32() }
    });

    const types = ['w', 'x', 'y', 'z'].map(name => at.getChild(name).type);

    assert.deepEqual(
      types.map(t => t.typeId),
      [Type.Utf8, Type.Int, Type.Float, Type.Bool],
      'type ids match'
    );
    assert.equal(types[1].bitWidth, 32, 'int32');
    assert.equal(types[2].precision, 1, 'float32');
  });

  it('encodes dictionary data', () => {
    const type = dictionary(utf8(), int32());
    const values = ['a', 'b', 'FOO', 'b', 'a'];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes boolean data', () => {
    const type = bool();
    const values = [true, false, false, true, false];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes date millis data', () => {
    dateTest(dateMillisecond());
  });

  it('encodes date day data', () => {
    dateTest(dateDay());
  });

  it('encodes int8 data', () => {
    integerTest(int8());
  });

  it('encodes int16 data', () => {
    integerTest(int16());
  });

  it('encodes int32 data', () => {
    integerTest(int32());
  });

  it('encodes int64 data', () => {
    bigintTest(int64());
  });

  it('encodes uint8 data', () => {
    integerTest(uint8());
  });

  it('encodes uint16 data', () => {
    integerTest(uint16());
  });

  it('encodes uint32 data', () => {
    integerTest(uint32());
  });

  it('encodes uint64 data', () => {
    bigintTest(uint64());
  });

  it('encodes float32 data', () => {
    floatTest(float32());
  });

  it('encodes float64 data', () => {
    floatTest(float64());
  });

  it('encodes list data', () => {
    const type = list(int32());
    const values = [[1, 2], [3], [4, 5, 6], [7]];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes fixed size list data', () => {
    const type = fixedSizeList(int32(), 1);
    const values = [[1], [2], [3], [4], [5], [6]];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes struct data', () => {
    const type = struct({ key: int32() });
    const values = [1, 2, 3, null, 5, 6].map(key => ({ key }));
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });
});

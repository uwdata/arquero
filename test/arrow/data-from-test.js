import assert from 'node:assert';
import {
  Bool, DateDay, DateMillisecond, Dictionary, Field, FixedSizeList,
  Float32, Float64, Int16, Int32, Int64, Int8, List, Struct, Table,
  Uint16, Uint32, Uint64, Uint8, Utf8, tableToIPC, vectorFromArray
} from 'apache-arrow';
import { dataFromScan } from '../../src/arrow/encode/data-from.js';
import { scanTable } from '../../src/arrow/encode/scan.js';
import { table } from '../../src/table/index.js';

function dataFromTable(table, column, type, nullable) {
  const nrows = table.numRows();
  const scan = scanTable(table, Infinity, 0);
  return dataFromScan(nrows, scan, column, type, nullable);
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
  const u = dataFromTable(dt, dt.column('values'), type);
  const v = vectorFromArray(values, type);
  const tu = new Table({ values: u });
  const tv = new Table({ values: v });

  assert.equal(
    tableToIPC(tu).join(' '),
    tableToIPC(tv).join(' '),
    'serialized data matches' + msg
  );
}

describe('dataFrom', () => {
  it('encodes dictionary data', () => {
    const type = new Dictionary(new Utf8(), new Uint32(), 0);
    const values = ['a', 'b', 'FOO', 'b', 'a'];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes boolean data', () => {
    const type = new Bool();
    const values = [true, false, false, true, false];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes date millis data', () => {
    dateTest(new DateMillisecond());
  });

  it('encodes date day data', () => {
    dateTest(new DateDay());
  });

  it('encodes int8 data', () => {
    integerTest(new Int8());
  });

  it('encodes int16 data', () => {
    integerTest(new Int16());
  });

  it('encodes int32 data', () => {
    integerTest(new Int32());
  });

  it('encodes int64 data', () => {
    bigintTest(new Int64());
  });

  it('encodes uint8 data', () => {
    integerTest(new Uint8());
  });

  it('encodes uint16 data', () => {
    integerTest(new Uint16());
  });

  it('encodes uint32 data', () => {
    integerTest(new Uint32());
  });

  it('encodes uint64 data', () => {
    bigintTest(new Uint64());
  });

  it('encodes float32 data', () => {
    floatTest(new Float32());
  });

  it('encodes float64 data', () => {
    floatTest(new Float64());
  });

  it('encodes list data', () => {
    const field = Field.new({ name: 'value', type: new Int32() });
    const type = new List(field);
    const values = [[1, 2], [3], [4, 5, 6], [7]];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes fixed size list data', () => {
    const field = Field.new({ name: 'value', type: new Int32() });
    const type = new FixedSizeList(1, field);
    const values = [[1], [2], [3], [4], [5], [6]];
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });

  it('encodes struct data', () => {
    const key = Field.new({ name: 'key', type: new Int32() });
    const type = new Struct([key]);
    const values = [1, 2, 3, null, 5, 6].map(key => ({ key }));
    valueTest(type, values, ', without nulls');
    valueTest(type, [null, ...values, null], ', with nulls');
  });
});

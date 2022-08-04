import tape from 'tape';
import {
  Bool, DateDay, DateMillisecond, Dictionary, Field, FixedSizeList,
  Float32, Float64, Int16, Int32, Int64, Int8, List, Struct, Table,
  Uint16, Uint32, Uint64, Uint8, Utf8, tableToIPC, vectorFromArray
} from 'apache-arrow';
import { dataFromScan } from '../../src/arrow/encode/data-from';
import { scanTable } from '../../src/arrow/encode/scan';
import { table } from '../../src/table';

function dataFromTable(table, column, type, nullable) {
  const nrows = table.numRows();
  const scan = scanTable(table, Infinity, 0);
  return dataFromScan(nrows, scan, column, type, nullable);
}

function integerTest(t, type) {
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
}

function floatTest(t, type) {
  const values = [0, NaN, 1/3, Math.PI, 7, Infinity, -Infinity];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
}

function bigintTest(t, type) {
  const values = [0n, 1n, 10n, 100n, 1000n, 10n ** 10n];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
}

function dateTest(t, type) {
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
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
}

function valueTest(t, type, values, msg) {
  const dt = table({ values });
  const u = dataFromTable(dt, dt.column('values'), type);
  const v = vectorFromArray(values, type);
  const tu = new Table({ values: u });
  const tv = new Table({ values: v });
  t.equal(
    tableToIPC(tu).join(' '),
    tableToIPC(tv).join(' '),
    'serialized data matches' + msg
  );
}

tape('dataFrom encodes dictionary data', t => {
  const type = new Dictionary(new Utf8(), new Uint32(), 0);
  const values = ['a', 'b', 'FOO', 'b', 'a'];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
  t.end();
});

tape('dataFrom encodes boolean data', t => {
  const type = new Bool();
  const values = [true, false, false, true, false];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
  t.end();
});

tape('dataFrom encodes date millis data', t => {
  dateTest(t, new DateMillisecond());
  t.end();
});

tape('dataFrom encodes date day data', t => {
  dateTest(t, new DateDay());
  t.end();
});

tape('dataFrom encodes int8 data', t => {
  integerTest(t, new Int8());
  t.end();
});

tape('dataFrom encodes int16 data', t => {
  integerTest(t, new Int16());
  t.end();
});

tape('dataFrom encodes int32 data', t => {
  integerTest(t, new Int32());
  t.end();
});

tape('dataFrom encodes int64 data', t => {
  bigintTest(t, new Int64());
  t.end();
});

tape('dataFrom encodes uint8 data', t => {
  integerTest(t, new Uint8());
  t.end();
});

tape('dataFrom encodes uint16 data', t => {
  integerTest(t, new Uint16());
  t.end();
});

tape('dataFrom encodes uint32 data', t => {
  integerTest(t, new Uint32());
  t.end();
});

tape('dataFrom encodes uint64 data', t => {
  bigintTest(t, new Uint64());
  t.end();
});

tape('dataFrom encodes float32 data', t => {
  floatTest(t, new Float32());
  t.end();
});

tape('dataFrom encodes float64 data', t => {
  floatTest(t, new Float64());
  t.end();
});

tape('dataFrom encodes list data', t => {
  const field = Field.new({ name: 'value', type: new Int32() });
  const type = new List(field);
  const values = [[1, 2], [3], [4, 5, 6], [7]];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
  t.end();
});

tape('dataFrom encodes fixed size list data', t => {
  const field = Field.new({ name: 'value', type: new Int32() });
  const type = new FixedSizeList(1, field);
  const values = [[1], [2], [3], [4], [5], [6]];
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
  t.end();
});

tape('dataFrom encodes struct data', t => {
  const key = Field.new({ name: 'key', type: new Int32() });
  const type = new Struct([key]);
  const values = [1, 2, 3, null, 5, 6].map(key => ({ key }));
  valueTest(t, type, values, ', without nulls');
  valueTest(t, type, [null, ...values, null], ', with nulls');
  t.end();
});
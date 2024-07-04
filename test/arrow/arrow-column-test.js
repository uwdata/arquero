import assert from 'node:assert';
import arrowColumn from '../../src/arrow/arrow-column.js';
import {
  DateDay, DateMillisecond, Int64, tableFromIPC, vectorFromArray
} from 'apache-arrow';

describe('arrowColumn', () => {
  it('converts date day data', () => {
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
    const vec = vectorFromArray(values, new DateDay());
    const proxy = arrowColumn(vec);

    assert.deepStrictEqual(
      Array.from(proxy),
      values,
      'date day converted'
    );
    assert.deepStrictEqual(
      Array.from(arrowColumn(vec, { convertDate: false })),
      values.map(v => +v),
      'date day unconverted'
    );
    assert.ok(proxy.at(0) === proxy.at(0), 'data day object equality');
  });

  it('converts date millisecond data', () => {
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
    const vec = vectorFromArray(values, new DateMillisecond());
    const proxy = arrowColumn(vec);

    assert.deepStrictEqual(
      Array.from(proxy),
      values,
      'date millisecond converted'
    );
    assert.deepStrictEqual(
      Array.from(arrowColumn(vec, { convertDate: false })),
      values.map(v => +v),
      'date millisecond unconverted'
    );
    assert.ok(proxy.at(0) === proxy.at(0), 'data millisecond object equality');
  });

  it('converts bigint data', () => {
    const values = [0n, 1n, 2n, 3n, 10n, 1000n];
    const vec = vectorFromArray(values, new Int64());

    assert.deepStrictEqual(
      Array.from(arrowColumn(vec, { convertBigInt: true })),
      values.map(v => Number(v)),
      'bigint converted'
    );
    assert.deepStrictEqual(
      Array.from(arrowColumn(vec)),
      values,
      'bigint unconverted'
    );
  });

  it('converts decimal data', () => {
    // encoded externally to sidestep arrow JS lib bugs:
    //   import pyarrow as pa
    //   v = pa.array([1, 12, 34], type=pa.decimal128(18, 3))
    //   batch = pa.record_batch([v], names=['d'])
    //   sink = pa.BufferOutputStream()
    //   with pa.ipc.new_stream(sink, batch.schema) as writer:
    //      writer.write_batch(batch)
    //   sink.getvalue().hex()
    const hex = 'FFFFFFFF780000001000000000000A000C000600050008000A000000000104000C000000080008000000040008000000040000000100000014000000100014000800060007000C00000010001000000000000107100000001C0000000400000000000000010000006400000008000C0004000800080000001200000003000000FFFFFFFF8800000014000000000000000C0016000600050008000C000C0000000003040018000000300000000000000000000A0018000C00040008000A0000003C00000010000000030000000000000000000000020000000000000000000000000000000000000000000000000000003000000000000000000000000100000003000000000000000000000000000000E8030000000000000000000000000000E02E0000000000000000000000000000D0840000000000000000000000000000FFFFFFFF00000000';
    const bytes = Uint8Array.from(hex.match(/.{1,2}/g).map(s => parseInt(s, 16)));
    const vec = tableFromIPC(bytes).getChild('d');

    assert.deepStrictEqual(
      Array.from(arrowColumn(vec, { convertDecimal: true })),
      [1, 12, 34],
      'decimal converted'
    );
    assert.deepEqual(
      Array.from(arrowColumn(vec, { convertDecimal: false })),
      [
        Uint32Array.from([1000, 0, 0, 0]),
        Uint32Array.from([12000, 0, 0, 0]),
        Uint32Array.from([34000, 0, 0, 0 ])
      ],
      'decimal unconverted'
    );
  });
});

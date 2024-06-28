import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';

describe('assign', () => {
  it('assign merges tables', () => {
    const t1 = table({ a: [1], b: [2], c: [3] });
    const t2 = table({ b: [-2], d: [4] });
    const t3 = table({ a: [-1], e: [5] });
    const dt = t1.assign(t2, t3);

    tableEqual(dt, {
      a: [-1], b: [-2], c: [3], d: [4], e: [5]
    }, 'assigned data');

    assert.deepEqual(
      dt.columnNames(),
      ['a', 'b', 'c', 'd', 'e'],
      'assigned names'
    );

    assert.throws(
      () => t1.assign(table({ c: [1, 2, 3] })),
      'throws on mismatched row counts'
    );

    tableEqual(t1.assign({ b: [-2], d: [4] }), {
      a: [1], b: [-2], c: [3], d: [4]
    }, 'assigned data from object');

    assert.throws(
      () => t1.assign({ c: [1, 2, 3] }),
      'throws on mismatched row counts from object'
    );
  });
});

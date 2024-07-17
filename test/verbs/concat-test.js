import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';

describe('concat', () => {
  it('combines tables', () => {
    const t1 = table({ a: [1, 2], b: [3, 4] });
    const t2 = table({ a: [3, 4], c: [5, 6] });
    const dt = t1.concat(t2);

    assert.equal(dt.numRows(), 4, 'num rows');
    assert.equal(dt.numCols(), 2, 'num cols');
    tableEqual(dt, {
      a: [1, 2, 3, 4],
      b: [3, 4, undefined, undefined]
    }, 'concat data');
  });

  it('combines multiple tables', () => {
    const t1 = table({ a: [1, 2], b: [3, 4] });
    const t2 = table({ a: [3, 4], c: [5, 6] });
    const t3 = table({ a: [5, 6], b: [7, 8] });

    const dt = t1.concat(t2, t3);
    assert.equal(dt.numRows(), 6, 'num rows');
    assert.equal(dt.numCols(), 2, 'num cols');
    tableEqual(dt, {
      a: [1, 2, 3, 4, 5, 6],
      b: [3, 4, undefined, undefined, 7, 8]
    }, 'concat data');

    const at = t1.concat([t2, t3]);
    assert.equal(at.numRows(), 6, 'num rows');
    assert.equal(at.numCols(), 2, 'num cols');
    tableEqual(at, {
      a: [1, 2, 3, 4, 5, 6],
      b: [3, 4, undefined, undefined, 7, 8]
    }, 'concat data');
  });
});

import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';

describe('dedupe', () => {
  it('de-duplicates table', () => {
    const dt = table({ a: [1, 2, 1, 2, 1], b: [3, 4, 3, 4, 5] })
      .dedupe();

    assert.equal(dt.numRows(), 3, 'num rows');
    assert.equal(dt.numCols(), 2, 'num cols');
    tableEqual(dt, {
      a: [1, 2, 1],
      b: [3, 4, 5]
    }, 'dedupe data');
    assert.equal(dt.isGrouped(), false, 'dedupe not grouped');
  });

  it('de-duplicates table based on keys', () => {
    const dt = table({ a: [1, 2, 1, 2, 1], b: [3, 4, 3, 4, 5] })
      .dedupe('a');

    assert.equal(dt.numRows(), 2, 'num rows');
    assert.equal(dt.numCols(), 2, 'num cols');
    tableEqual(dt, {
      a: [1, 2],
      b: [3, 4]
    }, 'dedupe data');
    assert.equal(dt.isGrouped(), false, 'dedupe not grouped');
  });
});

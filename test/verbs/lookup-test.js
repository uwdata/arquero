import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { op, table } from '../../src/index.js';

describe('lookup', () => {
  it('retrieves values from lookup table with string values', () => {
    const right = table({
      key: [1, 2, 3],
      u: ['a', 'b', 'c'],
      v: [5, 3, 1]
    });

    const left = table({
      id: [1, 2, 3, 4, 1]
    });

    const lt = left.lookup(right, ['id', 'key'], ['u', 'v']);

    assert.equal(lt.numRows(), 5, 'num rows');
    assert.equal(lt.numCols(), 3, 'num cols');

    tableEqual(lt, {
      id: [1, 2, 3, 4, 1],
      u: ['a', 'b', 'c', undefined, 'a'],
      v: [5, 3, 1, undefined, 5]
    }, 'lookup data');
  });

  it('retrieves values from lookup table with function values', () => {
    const right = table({
      key: [1, 2, 3],
      u: ['a', 'b', 'c'],
      v: [5, 3, 1]
    });

    const left = table({
      id: [1, 2, 3, 4, 1]
    });

    const lt = left.lookup(right, ['id', 'key'], {
      u: d => d.u,
      v: d => d.v - op.mean(d.v)
    });

    assert.equal(lt.numRows(), 5, 'num rows');
    assert.equal(lt.numCols(), 3, 'num cols');

    tableEqual(lt, {
      id: [1, 2, 3, 4, 1],
      u: ['a', 'b', 'c', undefined, 'a'],
      v: [2, 0, -2, undefined, 2]
    }, 'lookup data');
  });

  it('retrieves values from lookup table with implicit value rows', () => {
    const right = table({
      id: [1, 2, 3],
      u: ['a', 'b', 'c'],
      v: [5, 3, 1]
    });

    const left = table({
      id: [1, 2, 3, 4, 1],
      u: [-1, -1, -1, -1, -1]
    });

    const lt = left.lookup(right, 'id');

    assert.equal(lt.numRows(), 5, 'num rows');
    assert.equal(lt.numCols(), 3, 'num cols');

    tableEqual(lt, {
      id: [1, 2, 3, 4, 1],
      u: [-1, -1, -1, -1, -1],
      v: [5, 3, 1, undefined, 5]
    }, 'lookup data');
  });

  it('retrieves values from lookup table with implicit parameters', () => {
    const right = table({
      id: [1, 2, 3],
      u: ['a', 'b', 'c'],
      v: [5, 3, 1]
    });

    const left = table({
      id: [1, 2, 3, 4, 1]
    });

    const lt = left.lookup(right);

    assert.equal(lt.numRows(), 5, 'num rows');
    assert.equal(lt.numCols(), 3, 'num cols');

    tableEqual(lt, {
      id: [1, 2, 3, 4, 1],
      u: ['a', 'b', 'c', undefined, 'a'],
      v: [5, 3, 1, undefined, 5]
    }, 'lookup data');
  });
});

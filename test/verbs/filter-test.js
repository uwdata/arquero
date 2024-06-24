import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { op, table } from '../../src/index.js';

describe('filter', () => {
  it('filters a table', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).filter(d => 1 < d.a && d.a < 7).reify();

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    tableEqual(ft, { a: [3, 5], b: [4, 6] }, 'filtered data');
  });

  it('filters a filtered table', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols)
      .filter(d => 1 < d.a)
      .filter(d => d.a < 7)
      .reify();

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    tableEqual(ft, { a: [3, 5], b: [4, 6] }, 'filter data');
  });

  it('supports value functions', () => {
    const cols = { a: ['aa', 'ab', 'ba', 'bb'], b: [2, 4, 6, 8] };
    const ft = table(cols).filter(d => op.startswith(d.a, 'a'));
    tableEqual(ft, { a: ['aa', 'ab'], b: [2, 4] }, 'filter data');
  });

  it('supports aggregate functions', () => {
    const cols = { a: [1, 3, 5, 7], b: [2, 4, 6, 8] };
    const ft = table(cols).filter(({ a }) => a < op.median(a));
    tableEqual(ft, { a: [1, 3], b: [2, 4] }, 'filter data');
  });

  it('supports window functions', () => {
    const cols = { a: [1, 3, 5, 7], b: [2, 4, 6, 8]};
    const ft = table(cols).filter(({ a }) => op.lag(a) > 2);
    tableEqual(ft, { a: [5, 7], b: [6, 8] }, 'filter data');
  });
});

import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { desc, op, table } from '../../src/index.js';

describe('orderby', () => {
  it('orders a table', () => {
    const data = {
      a: [2, 2, 3, 3, 1, 1],
      b: [1, 2, 1, 2, 1, 2]
    };

    const ordered = {
      a: [1, 1, 2, 2, 3, 3],
      b: [2, 1, 2, 1, 2, 1]
    };

    const dt = table(data).orderby('a', desc('b'));

    const rows = [];
    dt.scan(row => rows.push(row), true);
    assert.deepEqual(rows, [5, 4, 1, 0, 3, 2], 'orderby scan');

    tableEqual(dt, ordered, 'orderby data');
  });

  it('supports aggregate functions', () => {
    const data = {
      a: [1, 2, 2, 3, 4, 5],
      b: [9, 8, 7, 6, 5, 4]
    };

    const dt = table(data)
      .groupby('a')
      .orderby(d => op.mean(d.b))
      .reify();

    tableEqual( dt, {
      a: [5, 4, 3, 2, 2, 1],
      b: [4, 5, 6, 8, 7, 9]
    }, 'orderby data');
  });

  it('throws on window functions', () => {
    const data = { a: [1, 3, 5, 7] };
    assert.throws(() => table(data).orderby({ res: d => op.lag(d.a) }), 'no window');
  });
});

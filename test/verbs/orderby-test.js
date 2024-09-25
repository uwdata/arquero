import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { collate, desc, op, table } from '../../src/index.js';

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

  it('orders a table with collate comparator', () => {
    const cmp = new Intl.Collator('tr-TR').compare;

    const data = {
      a: ['çilek', 'şeftali', 'erik', 'armut', 'üzüm', 'erik'],
      b: [1, 2, 1, 2, 1, 2]
    };

    const dt = table(data).orderby(collate('a', cmp), desc('b'));

    const rows = [];
    dt.scan(row => rows.push(row), true);
    assert.deepEqual(rows, [3, 0, 5, 2, 1, 4], 'orderby scan');

    tableEqual(
      dt,
      {
        a: ['armut', 'çilek', 'erik', 'erik', 'şeftali', 'üzüm'],
        b: [2, 1, 2, 1, 2, 1]
      },
      'orderby data'
    );

    tableEqual(
      table(data).orderby(desc(collate('a', cmp)), desc('b')),
      {
        a: ['üzüm', 'şeftali', 'erik', 'erik', 'çilek', 'armut'],
        b: [1, 2, 2, 1, 1, 2]
      },
      'orderby data'
    );
  });

  it('orders a table with collate locale', () => {
    const data = {
      a: ['çilek', 'şeftali', 'erik', 'armut', 'üzüm', 'erik'],
      b: [1, 2, 1, 2, 1, 2]
    };

    const dt = table(data).orderby(collate('a', 'tr-TR'), desc('b'));

    const rows = [];
    dt.scan(row => rows.push(row), true);
    assert.deepEqual(rows, [3, 0, 5, 2, 1, 4], 'orderby scan');

    tableEqual(
      dt,
      {
        a: ['armut', 'çilek', 'erik', 'erik', 'şeftali', 'üzüm'],
        b: [2, 1, 2, 1, 2, 1]
      },
      'orderby data'
    );

    tableEqual(
      table(data).orderby(desc(collate('a', 'tr-TR')), desc('b')),
      {
        a: ['üzüm', 'şeftali', 'erik', 'erik', 'çilek', 'armut'],
        b: [1, 2, 2, 1, 1, 2]
      },
      'orderby data'
    );
  });

  it('orders a table with combined annotations', () => {
    const data = {
      a: ['çilek', 'şeftali', 'erik', 'armut', 'üzüm', 'erik'],
      b: [1, 2, 1, 2, 1, 2]
    };

    const dt = table(data).orderby(desc(collate(d => d.a, 'tr-TR')), 'b');

    const rows = [];
    dt.scan(row => rows.push(row), true);
    assert.deepEqual(rows, [4, 1, 2, 5, 0, 3], 'orderby scan');

    tableEqual(
      dt,
      {
        a: ['üzüm', 'şeftali', 'erik', 'erik', 'çilek', 'armut'],
        b: [1, 2, 1, 2, 1, 2]
      },
      'orderby data'
    );
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

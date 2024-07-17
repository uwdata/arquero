import assert from 'node:assert';
import { desc, fromArrow, op, table, toArrow } from '../../src/index.js';

describe('groupby', () => {
  it('computes groups based on field names', () => {
    const data = {
      k: 'aabb'.split(''),
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const gt = table(data).groupby('k');

    assert.equal(gt.numRows(), 4, 'num rows');
    assert.equal(gt.numCols(), 3, 'num cols');
    assert.equal(gt.isGrouped(), true, 'is grouped');

    const { keys, names, rows, size } = gt.groups();
    assert.deepEqual(
      { keys, names, rows, size },
      {
        keys: Uint32Array.from([0, 0, 1, 1]),
        names: ['k'],
        rows: [0, 2],
        size: 2
      },
      'group data'
    );
  });

  it('computes groups based on a function', () => {
    const data = {
      k: 'aabb'.split(''),
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const gt = table(data).groupby({ key: d => d.k });

    assert.equal(gt.numRows(), 4, 'num rows');
    assert.equal(gt.numCols(), 3, 'num cols');
    assert.equal(gt.isGrouped(), true, 'is grouped');

    const { keys, names, rows, size } = gt.groups();
    assert.deepEqual(
      { keys, names, rows, size },
      {
        keys: Uint32Array.from([0, 0, 1, 1]),
        names: ['key'],
        rows: [0, 2],
        size: 2
      },
      'group data'
    );
  });

  it('supports aggregate functions', () => {
    const data = { a: [1, 3, 5, 7] };
    const gt = table(data).groupby({ res: d => op.abs(d.a - op.mean(d.a)) });

    const { keys, names, rows, size } = gt.groups();
    assert.deepEqual(
      { keys, names, rows, size },
      {
        keys: Uint32Array.from([0, 1, 1, 0]),
        names: ['res'],
        rows: [0, 1],
        size: 2
      },
      'group data'
    );
  });

  it('supports grouped aggregate functions', () => {
    const data = { k: [0, 0, 1, 1], a: [1, 3, 5, 7] };
    const gt = table(data)
      .groupby('k')
      .groupby({ res: d => d.a - op.mean(d.a) });

    const { keys, names, rows, size } = gt.groups();
    assert.deepEqual(
      { keys, names, rows, size },
      {
        keys: Uint32Array.from([0, 1, 0, 1]),
        names: ['res'],
        rows: [0, 1],
        size: 2
      },
      'group data'
    );
  });

  it('throws on window functions', () => {
    const data = { a: [1, 3, 5, 7] };
    assert.throws(() => table(data).groupby({ res: d => op.lag(d.a) }), 'no window');
  });

  it('persists after filter', () => {
    const dt = table({ a: [1, 3, 5, 7] })
      .groupby('a')
      .filter(d => d.a > 1);

    assert.ok(dt.isGrouped(), 'is grouped');

    const { rows, get } = dt.groups();
    assert.deepEqual(
      rows.map(r => get[0](r)),
      [3, 5, 7],
      'retrieves correct group values'
    );
  });

  it('persists after select', () => {
    const dt = table({ a: [1, 3, 5, 7], b: [2, 4, 6, 8] })
      .groupby('a')
      .select('b');

    assert.ok(dt.isGrouped(), 'is grouped');

    const { rows, get } = dt.groups();
    assert.deepEqual(
      rows.map(r => get[0](r)),
      [1, 3, 5, 7],
      'retrieves correct group values'
    );
  });

  it('persists after reify', () => {
    const dt = table({ a: [1, 3, 5, 7], b: [2, 4, 6, 8] })
      .groupby('a')
      .orderby(desc('b'))
      .filter(d => d.a > 1)
      .select('b')
      .reify();

    assert.ok(dt.isGrouped(), 'is grouped');

    const { rows, get } = dt.groups();
    assert.deepEqual(
      rows.map(r => get[0](r)),
      [3, 5, 7],
      'retrieves correct group values'
    );
  });

  it('optimizes Arrow dictionary columns', () => {
    const dt = fromArrow(toArrow(
      table({
        d: ['a', 'a', 'b', 'b'],
        v: [1, 2, 3, 4]
      })
    ));

    const gt = dt.groupby('d');
    assert.equal(
      gt.groups().keys,
      dt.column('d').groups().keys,
      'groupby reuses internal dictionary keys'
    );
  });
});

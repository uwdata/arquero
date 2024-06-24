import assert from 'node:assert';
import columnsFrom from '../../src/table/columns-from.js';

describe('columnsFrom', () => {
  it('supports array input', () => {
    assert.deepEqual(
      columnsFrom([]),
      { },
      'from empty array, names implicit'
    );

    assert.deepEqual(
      columnsFrom([], ['a', 'b']),
      { a: [], b: [] },
      'from empty array, names explicit'
    );

    assert.deepEqual(
      columnsFrom([ {a: 1, b: 2}, {a: 3, b: 4} ]),
      { a: [1, 3], b: [2, 4] },
      'from array, names implicit'
    );

    assert.deepEqual(
      columnsFrom([ {a: 1, b: 2}, {a: 3, b: 4} ], ['a', 'b']),
      { a: [1, 3], b: [2, 4] },
      'from array, names explicit'
    );

    assert.deepEqual(
      columnsFrom([ {a: 1, b: 2}, {a: 3, b: 4} ], ['b']),
      { b: [2, 4] },
      'from array, names partial'
    );
  });

  it('supports iterable input', () => {
    const data = [ {a: 1, b: 2}, {a: 3, b: 4} ];
    const iterable = {
      [Symbol.iterator]: () => data.values()
    };

    assert.deepEqual(
      columnsFrom(iterable),
      { a: [1, 3], b: [2, 4] },
      'from iterable, names implicit'
    );

    assert.deepEqual(
      columnsFrom(iterable, ['a', 'b']),
      { a: [1, 3], b: [2, 4] },
      'from iterable, names explicit'
    );

    assert.deepEqual(
      columnsFrom(iterable, ['b']),
      { b: [2, 4] },
      'from iterable, names partial'
    );
  });

  it('supports object input', () => {
    assert.deepEqual(
      columnsFrom({}),
      { key: [], value: [] },
      'from empty object, names implicit'
    );

    assert.deepEqual(
      columnsFrom([], ['k', 'v']),
      { k: [], v: [] },
      'from empty object, names explicit'
    );

    assert.deepEqual(
      columnsFrom({ a: 1, b: 2, c: 3 }),
      { key: ['a', 'b', 'c'], value: [1, 2, 3] },
      'from object, names implicit'
    );

    assert.deepEqual(
      columnsFrom({ a: 1, b: 2, c: 3 }, ['k', 'v']),
      { k: ['a', 'b', 'c'], v: [1, 2, 3] },
      'from object, names explicit'
    );

    assert.deepEqual(
      columnsFrom({ a: 1, b: 2, c: 3 }, [null, 'v']),
      { v: [1, 2, 3] },
      'from object, names partial'
    );
  });

  it('supports map input', () => {
    const map = new Map([ ['a', 1], ['b', 2], ['c', 3] ]);

    assert.deepEqual(
      columnsFrom(map),
      { key: ['a', 'b', 'c'], value: [1, 2, 3] },
      'from map, names implicit'
    );

    assert.deepEqual(
      columnsFrom(map, ['k', 'v']),
      { k: ['a', 'b', 'c'], v: [1, 2, 3] },
      'from map, names explicit'
    );

    assert.deepEqual(
      columnsFrom(map, [null, 'v']),
      { v: [1, 2, 3] },
      'from map, names partial'
    );
  });

  it('throws on unsupported type', () => {
    assert.throws(() => columnsFrom(true), 'no boolean');
    assert.throws(() => columnsFrom(new Date()), 'no date');
    assert.throws(() => columnsFrom(12.3), 'no number');
    assert.throws(() => columnsFrom(/bop/), 'no regexp');
    assert.throws(() => columnsFrom('foo'), 'no string');
  });
});

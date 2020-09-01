import tape from 'tape';
import columnsFrom from '../../src/table/columns-from';

tape('columnsFrom supports array input', t => {
  t.deepEqual(
    columnsFrom([]),
    { },
    'from empty array, names implicit'
  );

  t.deepEqual(
    columnsFrom([], ['a', 'b']),
    { a: [], b: [] },
    'from empty array, names explicit'
  );

  t.deepEqual(
    columnsFrom([ {a: 1, b: 2}, {a: 3, b: 4} ]),
    { a: [1, 3], b: [2, 4] },
    'from array, names implicit'
  );

  t.deepEqual(
    columnsFrom([ {a: 1, b: 2}, {a: 3, b: 4} ], ['a', 'b']),
    { a: [1, 3], b: [2, 4] },
    'from array, names explicit'
  );

  t.deepEqual(
    columnsFrom([ {a: 1, b: 2}, {a: 3, b: 4} ], ['b']),
    { b: [2, 4] },
    'from array, names partial'
  );

  t.deepEqual(
    columnsFrom([ null, {a: 1, b: 2}, undefined, {a: 3, b: 4}, null ]),
    { a: [1, 3], b: [2, 4] },
    'from array with nulls'
  );

  t.end();
});

tape('columnsFrom supports iterable input', t => {
  const data = [ {a: 1, b: 2}, {a: 3, b: 4} ];
  const iterable = {
    [Symbol.iterator]: () => data.values()
  };

  t.deepEqual(
    columnsFrom(iterable),
    { a: [1, 3], b: [2, 4] },
    'from iterable, names implicit'
  );

  t.deepEqual(
    columnsFrom(iterable, ['a', 'b']),
    { a: [1, 3], b: [2, 4] },
    'from iterable, names explicit'
  );

  t.deepEqual(
    columnsFrom(iterable, ['b']),
    { b: [2, 4] },
    'from iterable, names partial'
  );

  t.end();
});

tape('columnsFrom supports object input', t => {
  t.deepEqual(
    columnsFrom({}),
    { key: [], value: [] },
    'from empty object, names implicit'
  );

  t.deepEqual(
    columnsFrom([], ['k', 'v']),
    { k: [], v: [] },
    'from empty object, names explicit'
  );

  t.deepEqual(
    columnsFrom({ a: 1, b: 2, c: 3 }),
    { key: ['a', 'b', 'c'], value: [1, 2, 3] },
    'from object, names implicit'
  );

  t.deepEqual(
    columnsFrom({ a: 1, b: 2, c: 3 }, ['k', 'v']),
    { k: ['a', 'b', 'c'], v: [1, 2, 3] },
    'from object, names explicit'
  );

  t.deepEqual(
    columnsFrom({ a: 1, b: 2, c: 3 }, [null, 'v']),
    { v: [1, 2, 3] },
    'from object, names partial'
  );

  t.end();
});

tape('columnsFrom supports map input', t => {
  const map = new Map([ ['a', 1], ['b', 2], ['c', 3] ]);

  t.deepEqual(
    columnsFrom(map),
    { key: ['a', 'b', 'c'], value: [1, 2, 3] },
    'from map, names implicit'
  );

  t.deepEqual(
    columnsFrom(map, ['k', 'v']),
    { k: ['a', 'b', 'c'], v: [1, 2, 3] },
    'from map, names explicit'
  );

  t.deepEqual(
    columnsFrom(map, [null, 'v']),
    { v: [1, 2, 3] },
    'from map, names partial'
  );

  t.end();
});

tape('columnsFrom throws on unsupported type', t => {
  t.throws(() => columnsFrom(true), 'no boolean');
  t.throws(() => columnsFrom(new Date()), 'no date');
  t.throws(() => columnsFrom(12.3), 'no number');
  t.throws(() => columnsFrom(/bop/), 'no regexp');
  t.throws(() => columnsFrom('foo'), 'no string');
  t.end();
});
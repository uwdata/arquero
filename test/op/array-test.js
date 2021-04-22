import tape from 'tape';
import { op } from '../../src';

tape('op.compact compacts an array', t => {
  t.deepEqual(
    [
      op.compact(Float64Array.of(1, NaN, 2)),
      op.compact([ 1, 2, 3 ]),
      op.compact([ 1, null, 2, undefined, NaN, 3 ]),
      op.compact(null),
      op.compact(undefined),
      op.compact(NaN)
    ],
    [
      Float64Array.of(1, 2),
      [ 1, 2, 3 ],
      [ 1, 2, 3 ],
      null,
      undefined,
      NaN
    ],
    'compact'
  );
  t.end();
});

tape('op.concat concats an array', t => {
  t.deepEqual(
    [
      op.concat(),
      op.concat([ 1, 2 ], [ 3, 4 ], [ 5 ]),
      op.concat(1, 2, [ 3 ])
    ],
    [
      [],
      [ 1, 2, 3, 4, 5 ],
      [ 1, 2, 3 ]
    ],
    'concat'
  );
  t.end();
});

tape('op.includes checks if a sequence contains a value', t => {
  t.deepEqual(
    [
      op.includes([1, 2], 1),
      op.includes([1, 2], 1, 1),
      op.includes('12', '1'),
      op.includes('12', '1', 1),
      op.includes(null, 1),
      op.includes(undefined, 1),
      op.includes(NaN, 1)
    ],
    [
      true,
      false,
      true,
      false,
      false,
      false,
      false
    ],
    'includes'
  );
  t.end();
});

tape('op.indexof finds first index of a value', t => {
  t.deepEqual(
    [
      op.indexof([2, 1, 1], 1),
      op.indexof([2, 1, 1], 3),
      op.indexof('211', '1'),
      op.indexof('211', '3'),
      op.indexof(null, 1),
      op.indexof(undefined, 1),
      op.indexof(NaN, 1)
    ],
    [ 1, -1, 1, -1, -1, -1, -1 ],
    'indexof'
  );
  t.end();
});

tape('op.join maps an array to a string', t => {
  t.deepEqual(
    [
      op.join([2, 1, 1]),
      op.join([2, 1, 1], ' '),
      op.join('211', ' '),
      op.join(null),
      op.join(undefined),
      op.join(NaN)
    ],
    [ '2,1,1', '2 1 1', undefined, undefined, undefined, undefined],
    'join'
  );
  t.end();
});

tape('op.lastindexof finds last index of a value', t => {
  t.deepEqual(
    [
      op.lastindexof([2, 1, 1], 1),
      op.lastindexof([2, 1, 1], 3),
      op.lastindexof('211', '1'),
      op.lastindexof('211', '3'),
      op.lastindexof(null, 1),
      op.lastindexof(undefined, 1),
      op.lastindexof(NaN, 1)
    ],
    [ 2, -1, 2, -1, -1, -1, -1 ],
    'lastindexof'
  );
  t.end();
});

tape('op.length returns the length of a sequence', t => {
  t.deepEqual(
    [
      op.length([]),
      op.length(''),
      op.length([2, 1, 1]),
      op.length('211'),
      op.length(null),
      op.length(undefined),
      op.length(NaN)
    ],
    [ 0, 0, 3, 3, 0, 0, 0 ],
    'length'
  );
  t.end();
});

tape('op.pluck retrieves a property from each array element', t => {
  t.deepEqual(
    [
      op.pluck([], 'x'),
      op.pluck([{ x: 1 }, { x: 2 }, {}, 'foo'], 'x'),
      op.pluck('foo', 'x'),
      op.pluck(null, 'x'),
      op.pluck(undefined, 'x'),
      op.pluck(NaN, 'x')
    ],
    [
      [], [1, 2, undefined, undefined],
      undefined, undefined, undefined, undefined
    ],
    'pluck'
  );
  t.end();
});

tape('op.reverse reverses a sequence', t => {
  t.deepEqual(
    [
      op.reverse([]),
      op.reverse(''),
      op.reverse([2, 1, 1]),
      op.reverse('211'),
      op.reverse(null),
      op.reverse(undefined),
      op.reverse(NaN)
    ],
    [
      [], '', [1, 1, 2], '112',
      undefined, undefined, undefined
    ],
    'reverse'
  );
  t.end();
});

tape('op.slice extracts a subsequence', t => {
  t.deepEqual(
    [
      op.slice([2, 1, 3]),
      op.slice([2, 1, 3], 1),
      op.slice([2, 1, 3], 1, -1),
      op.slice('213'),
      op.slice('213', 1),
      op.slice('213', 1, -1),
      op.slice(null),
      op.slice(undefined),
      op.slice(NaN)
    ],
    [
      [2, 1, 3], [1, 3], [1],
      '213', '13', '1',
      undefined, undefined, undefined
    ],
    'slice'
  );
  t.end();
});

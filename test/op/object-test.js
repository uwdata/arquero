import tape from 'tape';
import { op } from '../../src';

tape('op.has checks if a object/map/set has a key', t => {
  t.deepEqual(
    [
      op.has({ a: 1}, 'a'),
      op.has({ a: 1}, 'b'),
      op.has(new Map([['a', 1]]), 'a'),
      op.has(new Map([['a', 1]]), 'b'),
      op.has(new Set(['a']), 'a'),
      op.has(new Set(['a']), 'b'),
      op.has(null, 'a'),
      op.has(undefined, 'a'),
      op.has(NaN, 'a')
    ],
    [
      true, false,
      true, false,
      true, false,
      false,
      false,
      false
    ],
    'has'
  );
  t.end();
});

tape('op.keys returns object/map keys', t => {
  t.deepEqual(
    [
      op.keys({ a: 1}),
      op.keys(new Map([['a', 1]])),
      op.keys(null),
      op.keys(undefined),
      op.keys(NaN)
    ],
    [ ['a'], ['a'], [], [], [] ],
    'keys'
  );
  t.end();
});

tape('op.values returns object/map/set values', t => {
  t.deepEqual(
    [
      op.values({ a: 1}),
      op.values(new Map([['a', 1]])),
      op.values(new Set(['a'])),
      op.values(null),
      op.values(undefined),
      op.values(NaN)
    ],
    [ [1], [1], ['a'], [], [], [] ],
    'values'
  );
  t.end();
});

tape('op.entries returns object/map/set entries', t => {
  t.deepEqual(
    [
      op.entries({ a: 1}),
      op.entries(new Map([['a', 1]])),
      op.entries(new Set(['a'])),
      op.entries(null),
      op.entries(undefined),
      op.entries(NaN)
    ],
    [ [['a', 1]], [['a', 1]], [['a', 'a']], [], [], [] ],
    'entries'
  );
  t.end();
});

tape('op.object constructs an object from iterable entries', t => {
  t.deepEqual(
    [
      op.object([['a', 1]]),
      op.object(new Map([['b', 2]])),
      op.object(null),
      op.object(undefined),
      op.object(NaN)
    ],
    [ {a: 1}, {b: 2}, undefined, undefined, undefined ],
    'object'
  );
  t.end();
});
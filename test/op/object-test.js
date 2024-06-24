import assert from 'node:assert';
import { op } from '../../src/index.js';

describe('object op', () => {
  it('has checks if a object/map/set has a key', () => {
    assert.deepEqual(
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
  });

  it('keys returns object/map keys', () => {
    assert.deepEqual(
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
  });

  it('values returns object/map/set values', () => {
    assert.deepEqual(
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
  });

  it('entries returns object/map/set entries', () => {
    assert.deepEqual(
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
  });

  it('object constructs an object from iterable entries', () => {
    assert.deepEqual(
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
  });
});

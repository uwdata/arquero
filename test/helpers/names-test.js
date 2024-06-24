import assert from 'node:assert';
import { names, table } from '../../src/index.js';

describe('names', () => {
  it('produces a rename map', () => {
    const dt = table({ x: [1], y: [2], z: [3] });
    const entries = [ ['x', 'a'], ['y', 'b'], ['z', 'c'] ];

    assert.deepEqual(
      [
        names('a', 'b', 'c')(dt),
        names(['a', 'b', 'c'])(dt),
        names(['a', 'b'], 'c')(dt),
        names('a', 'b')(dt),
        names('a', 'b', 'c', 'd')(dt)
      ],
      [
        new Map(entries),
        new Map(entries),
        new Map(entries),
        new Map(entries.slice(0, 2)),
        new Map(entries)
      ],
      'names helper'
    );
  });
});

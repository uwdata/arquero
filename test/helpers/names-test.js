import tape from 'tape';
import { names, table } from '../../src';

tape('names produces a rename map', t => {
  const dt = table({ x: [1], y: [2], z: [3] });
  const entries = [ ['x', 'a'], ['y', 'b'], ['z', 'c'] ];

  t.deepEqual(
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

  t.end();
});
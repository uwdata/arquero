import tape from 'tape';
import { op } from '../../src';

tape('op.compact compacts an array', t => {
  t.deepEqual(
    [
      op.compact(Float64Array.of(1, NaN, 2)),
      op.compact([ 1, 2, 3 ]),
      op.compact([ 1, null, 2, undefined, NaN, 3 ])
    ],
    [
      Float64Array.of(1, 2),
      [ 1, 2, 3 ],
      [ 1, 2, 3 ]
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
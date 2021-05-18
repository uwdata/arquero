import tape from 'tape';
import { agg, op, table } from '../../src';

tape('agg computes aggregate values', t => {
  const dt = table({ a: [1, 2, 3, 4] });

  t.deepEqual(
    {
      sum: agg(dt, op.sum('a')),
      max: agg(dt, op.max('a')),
      ext: agg(dt, d => [op.min(d.a), op.max(d.a)])
    },
    { sum: 10, max: 4, ext: [1, 4] },
    'agg helper'
  );

  t.end();
});
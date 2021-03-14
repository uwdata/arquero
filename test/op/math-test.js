import tape from 'tape';
import { op } from '../../src';

tape('op.greatest returns the greatest element', t => {
  t.equal(op.greatest(1, 2, 3), 3, 'greatest');
  t.equal(op.greatest(1, null, 3), 3, 'greatest with null');
  t.equal(op.greatest(1, undefined, 3), NaN, 'greatest with undefined');
  t.equal(op.greatest(1, NaN, 3), NaN, 'greatest with NaN');
  t.end();
});

tape('op.least returns the least element', t => {
  t.equal(op.least(1, 2, 3), 1, 'least');
  t.equal(op.least(1, null, 3), 0, 'least with null');
  t.equal(op.least(1, undefined, 3), NaN, 'least with undefined');
  t.equal(op.least(1, NaN, 3), NaN, 'least with NaN');
  t.end();
});
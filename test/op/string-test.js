import tape from 'tape';
import { op } from '../../src';

tape('op.match returns pattern matches', t => {
  t.deepEqual([
    op.match('foo', /bar/),
    op.match('1 2 3 4', /\d+/).slice(),
    op.match('1 2 3 4', /\d+/g),
    op.match('1 2 3 4', /\d+ (\d+)/, 1),
    op.match('1 2 3 4', /(?<digit>\d+)/, 'digit'),
    op.match('1 2 3 4', /\d+/, 'digit')
  ], [ null, ['1'], ['1', '2', '3', '4'], '2', '1', null ], 'match');
  t.end();
});
import tape from 'tape';
import { op } from '../../src/verbs';

tape('op.dayofyear returns the day of the year', t => {
  t.deepEqual([
    op.dayofyear(op.datetime(2000, 0, 1)),
    op.dayofyear(op.datetime(2000, 0, 2)),
    op.dayofyear(+op.datetime(2000, 11, 30)),
    op.dayofyear(+op.datetime(2000, 11, 31))
  ], [1, 2, 365, 366], 'dayofyear');
  t.end();
});

tape('op.week returns the week of the year', t => {
  t.deepEqual([
    op.week(op.datetime(2000, 0, 1)),
    op.week(op.datetime(2000, 0, 2)),
    op.week(+op.datetime(2000, 11, 30)),
    op.week(+op.datetime(2000, 11, 31))
  ], [0, 1, 52, 53], 'week');
  t.end();
});

tape('op.utcdayofyear returns the UTC day of the year', t => {
  t.deepEqual([
    op.utcdayofyear(op.utcdatetime(2000, 0, 1)),
    op.utcdayofyear(op.utcdatetime(2000, 0, 2)),
    op.utcdayofyear(+op.utcdatetime(2000, 11, 30)),
    op.utcdayofyear(+op.utcdatetime(2000, 11, 31))
  ], [1, 2, 365, 366], 'utcdayofyear');
  t.end();
});

tape('op.utcweek returns the UTC week of the year', t => {
  t.deepEqual([
    op.utcweek(op.utcdatetime(2000, 0, 1)),
    op.utcweek(op.utcdatetime(2000, 0, 2)),
    op.utcweek(+op.utcdatetime(2000, 11, 30)),
    op.utcweek(+op.utcdatetime(2000, 11, 31))
  ], [0, 1, 52, 53], 'week');
  t.end();
});
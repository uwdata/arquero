import assert from 'node:assert';
import { op } from '../../src/index.js';

describe('date op', () => {
  it('dayofyear returns the day of the year', () => {
    assert.deepEqual([
      op.dayofyear(op.datetime(2000, 0, 1)),
      op.dayofyear(op.datetime(2000, 0, 2)),
      op.dayofyear(+op.datetime(2000, 11, 30)),
      op.dayofyear(+op.datetime(2000, 11, 31))
    ], [1, 2, 365, 366], 'dayofyear');
  });

  it('week returns the week of the year', () => {
    assert.deepEqual([
      op.week(op.datetime(2000, 0, 1)),
      op.week(op.datetime(2000, 0, 2)),
      op.week(+op.datetime(2000, 11, 30)),
      op.week(+op.datetime(2000, 11, 31))
    ], [0, 1, 52, 53], 'week');
  });

  it('utcdayofyear returns the UTC day of the year', () => {
    assert.deepEqual([
      op.utcdayofyear(op.utcdatetime(2000, 0, 1)),
      op.utcdayofyear(op.utcdatetime(2000, 0, 2)),
      op.utcdayofyear(+op.utcdatetime(2000, 11, 30)),
      op.utcdayofyear(+op.utcdatetime(2000, 11, 31))
    ], [1, 2, 365, 366], 'utcdayofyear');
  });

  it('utcweek returns the UTC week of the year', () => {
    assert.deepEqual([
      op.utcweek(op.utcdatetime(2000, 0, 1)),
      op.utcweek(op.utcdatetime(2000, 0, 2)),
      op.utcweek(+op.utcdatetime(2000, 11, 30)),
      op.utcweek(+op.utcdatetime(2000, 11, 31))
    ], [0, 1, 52, 53], 'week');
  });
});

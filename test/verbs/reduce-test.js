import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';
import { countPattern } from '../../src/verbs/reduce/count-pattern.js';

describe('reduce', () => {
  it('produces multiple aggregates', () => {
    const data = {
      text: ['foo bar', 'foo', 'bar baz', 'baz']
    };

    const dt = table(data).reduce(countPattern('text'));

    assert.equal(dt.numRows(), 3, 'num rows');
    assert.equal(dt.numCols(), 2, 'num columns');
    tableEqual(dt, {
      word: ['foo', 'bar', 'baz'],
      count: [2, 2, 2]
    }, 'reduce data');
  });

  it('produces grouped multiple aggregates', () => {
    const data = {
      key: ['a', 'a', 'b', 'b'],
      text: ['foo bar', 'foo', 'bar baz', 'baz bop']
    };

    const dt = table(data)
      .groupby('key')
      .reduce(countPattern('text'));

    assert.equal(dt.numRows(), 5, 'num rows');
    assert.equal(dt.numCols(), 3, 'num columns');
    tableEqual(dt, {
      key: ['a', 'a', 'b', 'b', 'b'],
      word: ['foo', 'bar', 'bar', 'baz', 'bop'],
      count: [2, 1, 1, 2, 1]
    }, 'reduce data');
  });
});

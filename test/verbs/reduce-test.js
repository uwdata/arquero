import tape from 'tape';
import tableEqual from '../table-equal';
import countPattern from '../../src/engine/reduce/count-pattern';
import { table } from '../../src/verbs';

tape('reduce produces multiple aggregates', t => {
  const data = {
    text: ['foo bar', 'foo', 'bar baz', 'baz']
  };

  const dt = table(data).reduce(countPattern('text'));

  t.equal(dt.numRows(), 3, 'num rows');
  t.equal(dt.numCols(), 2, 'num columns');
  tableEqual(t, dt, {
    word: ['foo', 'bar', 'baz'],
    count: [2, 2, 2]
  }, 'reduce data');
  t.end();
});

tape('reduce produces grouped multiple aggregates', t => {
  const data = {
    key: ['a', 'a', 'b', 'b'],
    text: ['foo bar', 'foo', 'bar baz', 'baz bop']
  };

  const dt = table(data)
    .groupby('key')
    .reduce(countPattern('text'));

  t.equal(dt.numRows(), 5, 'num rows');
  t.equal(dt.numCols(), 3, 'num columns');
  tableEqual(t, dt, {
    key: ['a', 'a', 'b', 'b', 'b'],
    word: ['foo', 'bar', 'bar', 'baz', 'bop'],
    count: [2, 1, 1, 2, 1]
  }, 'reduce data');

  t.end();
});
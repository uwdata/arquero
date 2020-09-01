import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src/verbs';

tape('unroll generates rows for array values', t => {
  const data = {
    k: ['a', 'b'],
    x: [[1, 2, 3], [1, 2, 3]]
  };

  const ut = table(data).unroll('x', { limit: 2 });

  tableEqual(t, ut, {
    k: ['a', 'a', 'b', 'b'],
    x: [1, 2, 1, 2]
  }, 'unroll data');
  t.end();
});

tape('unroll generates rows for parallel array values', t => {
  const data = {
    k: ['a', 'b'],
    x: [[1, 2, 3], [4, 5, 6]],
    y: [[9, 8, 7], [9, 8]]
  };

  const ut = table(data).unroll(['x', 'y']);

  tableEqual(t, ut, {
    k: ['a', 'a', 'a', 'b', 'b', 'b'],
    x: [1, 2, 3, 4, 5, 6],
    y: [9, 8, 7, 9, 8, undefined]
  }, 'unroll data');
  t.end();
});

tape('unroll generates rows for derived array', t => {
  const data = {
    k: ['a', 'b'],
    x: ['foo bar', 'baz bop bop']
  };

  const ut = table(data).unroll({ t: d => op.split(d.x, ' ') });

  tableEqual(t, ut, {
    k: ['a', 'a', 'b', 'b', 'b'],
    x: ['foo bar', 'foo bar', 'baz bop bop', 'baz bop bop', 'baz bop bop'],
    t: ['foo', 'bar', 'baz', 'bop', 'bop']
  }, 'unroll data');
  t.end();
});

tape('unroll can invert a rollup', t => {
  const data = {
    k: ['a', 'a', 'b', 'b'],
    x: [1, 2, 3, 4]
  };

  const ut = table(data)
    .groupby('k')
    .rollup({ x: d => op.values(d.x) })
    .unroll('x');

  tableEqual(t, ut, data, 'unroll rollup data');
  t.end();
});

tape('unroll preserves column order', t => {
  const ut = table({
      x: [[1, 2, 3, 4, 5]],
      v: [0]
    })
    .unroll('x');

  tableEqual(t, ut, {
    x: [1, 2, 3, 4, 5],
    v: [0, 0, 0, 0, 0]
  }, 'unroll data');

  t.end();
});
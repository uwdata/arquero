import tape from 'tape';
import tableEqual from '../table-equal';
import { not, op, table } from '../../src';

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

tape('unroll generates rows for array values with index', t => {
  const data = {
    k: ['a', 'b'],
    x: [[1, 2, 3], [1, 2, 3]]
  };

  const ut = table(data).unroll('x', { limit: 2, index: true });

  tableEqual(t, ut, {
    k: ['a', 'a', 'b', 'b'],
    x: [1, 2, 1, 2],
    index: [0, 1, 0, 1]
  }, 'unroll data with index');
  t.end();
});

tape('unroll generates rows for array values with named index', t => {
  const data = {
    k: ['a', 'b'],
    x: [[1, 2, 3], [1, 2, 3]]
  };

  const ut = table(data).unroll('x', { limit: 2, index: 'arridx' });

  tableEqual(t, ut, {
    k: ['a', 'a', 'b', 'b'],
    x: [1, 2, 1, 2],
    arridx: [0, 1, 0, 1]
  }, 'unroll data with index');
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

tape('unroll generates rows for parallel array values with index', t => {
  const data = {
    k: ['a', 'b'],
    x: [[1, 2, 3], [4, 5, 6]],
    y: [[9, 8, 7], [9, 8]]
  };

  const ut = table(data).unroll(['x', 'y'], { index: true });

  tableEqual(t, ut, {
    k: ['a', 'a', 'a', 'b', 'b', 'b'],
    x: [1, 2, 3, 4, 5, 6],
    y: [9, 8, 7, 9, 8, undefined],
    index: [0, 1, 2, 0, 1, 2]
  }, 'unroll data with index');
  t.end();
});

tape('unroll generates rows for parallel array values with named index', t => {
  const data = {
    k: ['a', 'b'],
    x: [[1, 2, 3], [4, 5, 6]],
    y: [[9, 8, 7], [9, 8]]
  };

  const ut = table(data).unroll(['x', 'y'], { index: 'arridx' });

  tableEqual(t, ut, {
    k: ['a', 'a', 'a', 'b', 'b', 'b'],
    x: [1, 2, 3, 4, 5, 6],
    y: [9, 8, 7, 9, 8, undefined],
    arridx: [0, 1, 2, 0, 1, 2]
  }, 'unroll data with index');
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
    .rollup({ x: d => op.array_agg(d.x) })
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

tape('unroll can drop columns', t => {
  const dt = table({
      x: [[1, 2, 3, 4, 5]],
      u: [0],
      v: [1]
    });

  tableEqual(t, dt.unroll('x', { drop: 'x' }), {
    u: [0, 0, 0, 0, 0],
    v: [1, 1, 1, 1, 1]
  }, 'unroll drop-1 data');

  tableEqual(t, dt.unroll('x', { drop: ['u', 'x'] }), {
    v: [1, 1, 1, 1, 1]
  }, 'unroll drop-2 array data');

  tableEqual(t, dt.unroll('x', { drop: [0, 1] }), {
    v: [1, 1, 1, 1, 1]
  }, 'unroll drop-2 index data');

  tableEqual(t, dt.unroll('x', { drop: { u: 1, x: 1 } }), {
    v: [1, 1, 1, 1, 1]
  }, 'unroll drop-2 object data');

  tableEqual(t, dt.unroll('x', { drop: not('v') }), {
    v: [1, 1, 1, 1, 1]
  }, 'unroll drop-not data');

  t.end();
});
import tableEqual from '../table-equal.js';
import { not, op, table } from '../../src/index.js';

describe('unroll', () => {
  it('generates rows for array values', () => {
    const data = {
      k: ['a', 'b'],
      x: [[1, 2, 3], [1, 2, 3]]
    };

    const ut = table(data).unroll('x', { limit: 2 });

    tableEqual(ut, {
      k: ['a', 'a', 'b', 'b'],
      x: [1, 2, 1, 2]
    }, 'unroll data');
  });

  it('generates rows for array values with index', () => {
    const data = {
      k: ['a', 'b'],
      x: [[1, 2, 3], [1, 2, 3]]
    };

    const ut = table(data).unroll('x', { limit: 2, index: true });

    tableEqual(ut, {
      k: ['a', 'a', 'b', 'b'],
      x: [1, 2, 1, 2],
      index: [0, 1, 0, 1]
    }, 'unroll data with index');
  });

  it('generates rows for array values with named index', () => {
    const data = {
      k: ['a', 'b'],
      x: [[1, 2, 3], [1, 2, 3]]
    };

    const ut = table(data).unroll('x', { limit: 2, index: 'arridx' });

    tableEqual(ut, {
      k: ['a', 'a', 'b', 'b'],
      x: [1, 2, 1, 2],
      arridx: [0, 1, 0, 1]
    }, 'unroll data with index');
  });

  it('generates rows for parallel array values', () => {
    const data = {
      k: ['a', 'b'],
      x: [[1, 2, 3], [4, 5, 6]],
      y: [[9, 8, 7], [9, 8]]
    };

    const ut = table(data).unroll(['x', 'y']);

    tableEqual(ut, {
      k: ['a', 'a', 'a', 'b', 'b', 'b'],
      x: [1, 2, 3, 4, 5, 6],
      y: [9, 8, 7, 9, 8, undefined]
    }, 'unroll data');
  });

  it('generates rows for parallel array values with index', () => {
    const data = {
      k: ['a', 'b'],
      x: [[1, 2, 3], [4, 5, 6]],
      y: [[9, 8, 7], [9, 8]]
    };

    const ut = table(data).unroll(['x', 'y'], { index: true });

    tableEqual(ut, {
      k: ['a', 'a', 'a', 'b', 'b', 'b'],
      x: [1, 2, 3, 4, 5, 6],
      y: [9, 8, 7, 9, 8, undefined],
      index: [0, 1, 2, 0, 1, 2]
    }, 'unroll data with index');
  });

  it('generates rows for parallel array values with named index', () => {
    const data = {
      k: ['a', 'b'],
      x: [[1, 2, 3], [4, 5, 6]],
      y: [[9, 8, 7], [9, 8]]
    };

    const ut = table(data).unroll(['x', 'y'], { index: 'arridx' });

    tableEqual(ut, {
      k: ['a', 'a', 'a', 'b', 'b', 'b'],
      x: [1, 2, 3, 4, 5, 6],
      y: [9, 8, 7, 9, 8, undefined],
      arridx: [0, 1, 2, 0, 1, 2]
    }, 'unroll data with index');
  });

  it('generates rows for derived array', () => {
    const data = {
      k: ['a', 'b'],
      x: ['foo bar', 'baz bop bop']
    };

    const ut = table(data).unroll({ t: d => op.split(d.x, ' ') });

    tableEqual(ut, {
      k: ['a', 'a', 'b', 'b', 'b'],
      x: ['foo bar', 'foo bar', 'baz bop bop', 'baz bop bop', 'baz bop bop'],
      t: ['foo', 'bar', 'baz', 'bop', 'bop']
    }, 'unroll data');
  });

  it('can invert a rollup', () => {
    const data = {
      k: ['a', 'a', 'b', 'b'],
      x: [1, 2, 3, 4]
    };

    const ut = table(data)
      .groupby('k')
      .rollup({ x: d => op.array_agg(d.x) })
      .unroll('x');

    tableEqual(ut, data, 'unroll rollup data');
  });

  it('preserves column order', () => {
    const ut = table({
        x: [[1, 2, 3, 4, 5]],
        v: [0]
      })
      .unroll('x');

    tableEqual(ut, {
      x: [1, 2, 3, 4, 5],
      v: [0, 0, 0, 0, 0]
    }, 'unroll data');
  });

  it('can drop columns', () => {
    const dt = table({
        x: [[1, 2, 3, 4, 5]],
        u: [0],
        v: [1]
      });

    tableEqual(dt.unroll('x', { drop: 'x' }), {
      u: [0, 0, 0, 0, 0],
      v: [1, 1, 1, 1, 1]
    }, 'unroll drop-1 data');

    tableEqual(dt.unroll('x', { drop: ['u', 'x'] }), {
      v: [1, 1, 1, 1, 1]
    }, 'unroll drop-2 array data');

    tableEqual(dt.unroll('x', { drop: [0, 1] }), {
      v: [1, 1, 1, 1, 1]
    }, 'unroll drop-2 index data');

    tableEqual(dt.unroll('x', { drop: { u: 1, x: 1 } }), {
      v: [1, 1, 1, 1, 1]
    }, 'unroll drop-2 object data');

    tableEqual(dt.unroll('x', { drop: not('v') }), {
      v: [1, 1, 1, 1, 1]
    }, 'unroll drop-not data');
  });
});

import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { op, table } from '../../src/index.js';

describe('pivot', () => {
  it('generates cross-tabulation for single value', () => {
    const data = {
      k: ['a', 'b', 'c'],
      x: [1, 2, 3]
    };

    const ut = table(data).pivot('k', 'x');
    tableEqual(ut, {
      a: [ 1 ], b: [ 2 ], c: [ 3 ]
    }, 'pivot data');
  });

  it('generates cross-tabulation for single value as function', () => {
    const data = {
      k: ['a', 'b', 'c'],
      x: [1, 2, 3]
    };

    const ut = table(data).pivot('k', { x: d => op.any(d.x) });
    tableEqual(ut, {
      a: [ 1 ], b: [ 2 ], c: [ 3 ]
    }, 'pivot data');
  });

  it('generates cross-tabulation with groupby', () => {
    const data = {
      g: [0, 0, 1, 1],
      k: ['a', 'b', 'a', 'b'],
      x: [1, 2, 3, 4]
    };

    const ut = table(data).groupby('g').pivot('k', 'x');
    tableEqual(ut, {
      g: [ 0, 1 ], a: [ 1, 3 ], b: [ 2, 4 ]
    }, 'pivot data');
  });

  it('generates cross-tabulation for multiple values', () => {
    const data = {
      k: ['a', 'b', 'b', 'c'],
      x: [+1, +2, +2, +3],
      y: [-9, -2, +2, -7]
    };

    const ut = table(data).pivot('k', {
      x: d => op.sum(d.x),
      y: d => op.product(op.abs(d.y))
    });

    tableEqual(ut, {
      x_a: [ 1 ],
      x_b: [ 4 ],
      x_c: [ 3 ],
      y_a: [ 9 ],
      y_b: [ 4 ],
      y_c: [ 7 ]
    }, 'pivot data');
  });

  it('respects input options', () => {
    const data = {
      k: ['a', 'b', 'c'],
      j: ['d', 'e', 'f'],
      x: [1, 2, 3],
      y: [9, 8, 7]
    };

    const ut = table(data).pivot(['k', 'j'], ['x', 'y'], {
      keySeparator: '/',
      valueSeparator: ':',
      limit: 2
    });

    tableEqual(ut, {
      'x:a/d': [ 1 ],
      'x:b/e': [ 2 ],
      'y:a/d': [ 9 ],
      'y:b/e': [ 8 ]
    }, 'pivot data');
  });

  it('correctly orders integer column names', () => {
    const data = {
      g: ['a', 'a', 'a', 'b', 'b', 'b'],
      k: [2002, 2001, 2000, 2002, 2001, 2000],
      x: [1, 2, 3, 4, 5, 6]
    };

    const ut = table(data)
      .groupby('g')
      .pivot('k', 'x', { sort: false });

    tableEqual(ut, {
      'g': ['a', 'b'], '2002': [ 1, 4 ], '2001': [ 2, 5 ], '2000': [ 3, 6 ]
    }, 'pivot data');

    assert.deepEqual(ut.columnNames(), ['g', '2002', '2001', '2000']);
  });

  it('handles filtered and ordered table', () => {
    const dt = table({
        country: ['France', 'France', 'France', 'Germany', 'Germany', 'Germany', 'Japan', 'Japan', 'Japan'],
        year: [2017, 2018, 2019, 2017, 2018, 2019, 2017, 2018, 2019],
        expenditure: ['NA', 51410, 52229, 45340, 46512, 51190, 46542, 46618, 46562]
      })
      .filter(d => d.year > 2017)
      .orderby('country')
      .groupby('country')
      .pivot('year', 'expenditure');

    tableEqual(dt, {
      country: ['France', 'Germany', 'Japan'],
      2018: [51410, 46512, 46618],
      2019: [52229,51190,46562]
    }, 'pivot data');
  });

  it('handles count aggregates', () => {
    const data = {
      k: ['a', 'b', 'b']
    };

    const ut = table(data).pivot('k', { count: op.count() });
    tableEqual(ut, {
      a: [ 1 ], b: [ 2 ]
    }, 'pivot data');
  });
});

import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src/verbs';

tape('pivot generates cross-tabulation for single value', t => {
  const data = {
    k: ['a', 'b', 'c'],
    x: [1, 2, 3]
  };

  const ut = table(data).pivot('k', 'x');
  tableEqual(t, ut, {
    a: [ 1 ], b: [ 2 ], c: [ 3 ]
  }, 'pivot data');
  t.end();
});

tape('pivot generates cross-tabulation for single value as function', t => {
  const data = {
    k: ['a', 'b', 'c'],
    x: [1, 2, 3]
  };

  const ut = table(data).pivot('k', { x: d => op.any(d.x) });
  tableEqual(t, ut, {
    a: [ 1 ], b: [ 2 ], c: [ 3 ]
  }, 'pivot data');
  t.end();
});

tape('pivot generates cross-tabulation with groupby', t => {
  const data = {
    g: [0, 0, 1, 1],
    k: ['a', 'b', 'a', 'b'],
    x: [1, 2, 3, 4]
  };

  const ut = table(data).groupby('g').pivot('k', 'x');
  tableEqual(t, ut, {
    g: [ 0, 1 ], a: [ 1, 3 ], b: [ 2, 4 ]
  }, 'pivot data');
  t.end();
});

tape('pivot generates cross-tabulation for multiple values', t => {
  const data = {
    k: ['a', 'b', 'b', 'c'],
    x: [+1, +2, +2, +3],
    y: [-9, -2, +2, -7]
  };

  const ut = table(data).pivot('k', {
    x: d => op.sum(d.x),
    y: d => op.product(op.abs(d.y))
  });

  tableEqual(t, ut, {
    a_x: [ 1 ],
    b_x: [ 4 ],
    c_x: [ 3 ],
    a_y: [ 9 ],
    b_y: [ 4 ],
    c_y: [ 7 ]
  }, 'pivot data');

  t.end();
});

tape('pivot respects input options', t => {
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

  tableEqual(t, ut, {
    'a/d:x': [ 1 ],
    'b/e:x': [ 2 ],
    'a/d:y': [ 9 ],
    'b/e:y': [ 8 ]
  }, 'pivot data');

  t.end();
});

tape('pivot correctly orders integer column names', t => {
  const data = {
    g: ['a', 'a', 'a', 'b', 'b', 'b'],
    k: [2002, 2001, 2000, 2002, 2001, 2000],
    x: [1, 2, 3, 4, 5, 6]
  };

  const ut = table(data)
    .groupby('g')
    .pivot('k', 'x', { sort: false });

  tableEqual(t, ut, {
    'g': ['a', 'b'], '2002': [ 1, 4 ], '2001': [ 2, 5 ], '2000': [ 3, 6 ]
  }, 'pivot data');

  t.deepEqual(ut.columnNames(), ['g', '2002', '2001', '2000']);
  t.end();
});
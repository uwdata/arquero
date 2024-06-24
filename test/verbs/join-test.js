import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { all, not, op, table } from '../../src/index.js';

function joinTables() {
  return [
    table({
      k: ['a', 'b', 'b', 'c'],
      x: [1, 2, 3, 4],
      y: [9, 8, 7, 6]
    }),
    table({
      u: ['b', 'a', 'b', 'd'],
      v: [5, 4, 6, 0]
    })
  ];
}

describe('cross', () => {
  it('computes Cartesian product', () => {
    const [tl, tr] = joinTables();

    const tj = tl.cross(tr);

    assert.equal(tj.numRows(), tl.numRows() * tr.numRows());
    tableEqual(tj,  {
      k: [ 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c' ],
      x: [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4 ],
      y: [ 9, 9, 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6 ],
      u: [ 'b', 'a', 'b', 'd', 'b', 'a', 'b', 'd', 'b', 'a', 'b', 'd', 'b', 'a', 'b', 'd' ],
      v: [ 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0 ]
    }, 'cross data');
  });

  it('computes Cartesian product with column selection', () => {
    const [tl, tr] = joinTables();

    const tj = tl.cross(tr, [not('y'), not('u')]);

    assert.equal(tj.numRows(), tl.numRows() * tr.numRows());
    tableEqual(tj,  {
      k: [ 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c' ],
      x: [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4 ],
      v: [ 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0 ]
    }, 'selected cross data');
  });

  it('computes Cartesian product with column renaming', () => {
    const [tl, tr] = joinTables();

    const tj = tl.cross(tr, [
      {j: d => d.k, z: d => d.x},
      {w: d => d.v}
    ]);

    assert.equal(tj.numRows(), tl.numRows() * tr.numRows());
    tableEqual(tj,  {
      j: [ 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c' ],
      z: [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4 ],
      w: [ 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0 ]
    }, 'selected cross data');
  });
});

describe('join', () => {
  it('performs natural join', () => {
    const tl = table({ k: [1, 2, 3], a: [3, 4, 1]});
    const t1 = table({ k: [1, 2, 4], b: [5, 6, 2]});
    const t2 = table({ u: [1, 2], v: [5, 6]});

    tableEqual(tl.join(t1), {
      k: [ 1, 2 ],
      a: [ 3, 4 ],
      b: [ 5, 6 ]
    }, 'natural join data, common columns');

    tableEqual(tl.join_left(t1), {
      k: [ 1, 2, 3 ],
      a: [ 3, 4, 1 ],
      b: [ 5, 6, undefined ]
    }, 'natural left join data, common columns');

    tableEqual(tl.join_right(t1), {
      k: [ 1, 2, 4 ],
      a: [ 3, 4, undefined ],
      b: [ 5, 6, 2 ]
    }, 'natural right join data, common columns');

    tableEqual(tl.join_full(t1), {
      k: [ 1, 2, 3, 4 ],
      a: [ 3, 4, 1, undefined ],
      b: [ 5, 6, undefined, 2 ]
    }, 'natural full join data, common columns');

    assert.throws(
      () =>tl.join(t2),
      'natural join throws, no common columns'
    );
  });

  it('handles filtered tables', () => {
    const tl = table({
      key: [1, 2, 3, 4],
      value1: [1, 2, 3, 4]
    }).filter(d => d.key < 3);

    const tr = table({
      key: [1, 2, 5],
      value2: [1, 2, 5]
    });

    tableEqual(tl.join_left(tr), {
      key: [ 1, 2 ],
      value1: [ 1, 2 ],
      value2: [ 1, 2 ]
    }, 'natural left join on filtered data');

    tableEqual(tl.join_right(tr), {
      key: [ 1, 2, 5 ],
      value1: [ 1, 2, undefined ],
      value2: [ 1, 2, 5 ]
    }, 'natural right join on filtered data');

    const dt = table({
      year:  [2017, 2017, 2017, 2018, 2018, 2018],
      month: ['01', '02', 'YR', '01', '02', 'YR'],
      count: [6074, 7135, 220582, 5761, 6764, 222153]
    });

    const jt = dt
      .filter(d => d.month === 'YR')
      .select('year', {count: 'total'})
      .join(dt.filter(d => d.month !== 'YR'));

    tableEqual(jt, {
      total: [ 220582, 220582, 222153, 222153 ],
      year: [ 2017, 2017, 2018, 2018 ],
      month: [ '01', '02', '01', '02' ],
      count: [ 6074, 7135, 5761, 6764 ]
    }, 'join of two filtered tables');
  });

  it('performs inner join with predicate', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join(tr, (a, b) => a.k === b.u, {
      k: d => d.k,
      x: d => d.x,
      y: d => d.y,
      u: (a, b) => b.u,
      v: (a, b) => b.v,
      z: (a, b) => a.x + b.v
    });

    tableEqual(tj, {
      k: [ 'a', 'b', 'b', 'b', 'b' ],
      x: [ 1, 2, 2, 3, 3 ],
      y: [ 9, 8, 8, 7, 7 ],
      u: [ 'a', 'b', 'b', 'b', 'b' ],
      v: [ 4, 5, 6, 5, 6 ],
      z: [ 5, 7, 8, 8, 9 ]
    }, 'inner join data');
  });

  it('performs inner join with keys', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join(tr, ['k', 'u'], [all(), not('u')]);

    tableEqual(tj, {
      k: [ 'a', 'b', 'b', 'b', 'b' ],
      x: [ 1, 2, 2, 3, 3 ],
      y: [ 9, 8, 8, 7, 7 ],
      v: [ 4, 5, 6, 5, 6 ]
    }, 'inner join data');
  });

  it('handles column name collisions', () => {
    const [tl] = joinTables();
    const tr = table({ k: ['a', 'b'], x: [9, 8] });

    const tj_inner = tl.join(tr, 'k');
    tableEqual(tj_inner, {
      k: [ 'a', 'b', 'b' ],
      x_1: [ 1, 2, 3 ],
      y: [ 9, 8, 7 ],
      x_2: [ 9, 8, 8 ]
    }, 'name collision inner join data');

    const tj_full = tl.join_full(tr, 'k');
    tableEqual(tj_full, {
      k: [ 'a', 'b', 'b', 'c' ],
      x_1: [ 1, 2, 3, 4 ],
      y: [ 9, 8, 7, 6 ],
      x_2: [ 9, 8, 8, undefined ]
    }, 'name collision full join data');

    const tj1 = tl.join(tr, ['k', 'k'], [all(), all()]);
    tableEqual(tj1, {
      k_1: [ 'a', 'b', 'b' ],
      x_1: [ 1, 2, 3 ],
      y: [ 9, 8, 7 ],
      k_2: [ 'a', 'b', 'b' ],
      x_2: [ 9, 8, 8 ]
    }, 'name collision join data');

    const tj2 = tl.join(tr, ['k', 'k'], [
      all(),
      all(),
      { y: (a, b) => a.x + b.x }
    ]);
    tableEqual(tj2, {
      k_1: [ 'a', 'b', 'b' ],
      x_1: [ 1, 2, 3 ],
      k_2: [ 'a', 'b', 'b' ],
      x_2: [ 9, 8, 8 ],
      y: [ 10, 10, 11 ]
    }, 'name override join data');
  });

  it('does not treat null values as equal', () => {
    const tl = table({ u: ['a', null, undefined, NaN], a: [1, 2, 3, 4] });
    const tr = table({ v: [null, undefined, NaN, 'a'], b: [9, 8, 7, 6] });

    const tj1 = tl.join(tr, ['u', 'v'], [all(), all()]);

    tableEqual(tj1, {
      u: [ 'a' ],
      v: [ 'a' ],
      a: [ 1 ],
      b: [ 6 ]
    }, 'null join data with keys');

    const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v), [all(), all()]);

    tableEqual(tj2, {
      u: [ 'a' ],
      v: [ 'a' ],
      a: [ 1 ],
      b: [ 6 ]
    }, 'null join data with equal predicate');
  });

  it('supports date-valued keys', () => {
    const d1 = new Date(2000, 0, 1);
    const d2 = new Date(2012, 1, 3);
    const tl = table({ u: [d1, d2, null], a: [9, 8, 7] });
    const tr = table({ v: [new Date(+d1), +d2], b: [5, 4] });

    const tj1 = tl.join(tr, ['u', 'v'], [all(), not('v')]);

    tableEqual(tj1, {
      u: [d1, d2],
      a: [9, 8],
      b: [5, 4]
    }, 'hash join data with date keys');

    const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v), [all(), not('v')]);

    tableEqual(tj2, {
      u: [d1, d2],
      a: [9, 8],
      b: [5, 4]
    }, 'loop join data with date keys');
  });

  it('supports regexp-valued keys', () => {
    const tl = table({ u: [/foo/g, /bar.*/i, null], a: [9, 8, 7] });
    const tr = table({ v: [/foo/g, /bar.*/i], b: [5, 4] });

    const tj1 = tl.join(tr, ['u', 'v'], [all(), not('v')]);

    tableEqual(tj1, {
      u: [/foo/g, /bar.*/i],
      a: [9, 8],
      b: [5, 4]
    }, 'hash join data with regexp keys');

    const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v), [all(), not('v')]);

    tableEqual(tj2, {
      u: [/foo/g, /bar.*/i],
      a: [9, 8],
      b: [5, 4]
    }, 'loop join data with regexp keys');
  });

  it('supports array-valued keys', () => {
    const tl = table({ u: [[1, 2], [3, 4], null], a: [9, 8, 7] });
    const tr = table({ v: [[1, 2], [3, 4]], b: [5, 4] });

    const tj1 = tl.join(tr, ['u', 'v']);

    tableEqual(tj1, {
      u: [[1, 2], [3, 4]],
      a: [9, 8],
      v: [[1, 2], [3, 4]],
      b: [5, 4]
    }, 'hash join data with array keys');

    const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v));

    tableEqual(tj2, {
      u: [[1, 2], [3, 4]],
      a: [9, 8],
      v: [[1, 2], [3, 4]],
      b: [5, 4]
    }, 'loop join data with array keys');
  });

  it('supports object-valued keys', () => {
    const tl = table({ u: [{k: 1, l: [2]}, {k: 2}, null], a: [9, 8, 7] });
    const tr = table({ v: [{k: 1, l: [2]}, {k: 2}], b: [5, 4] });

    const tj1 = tl.join(tr, ['u', 'v']);

    tableEqual(tj1, {
      u: [{k: 1, l: [2]}, {k: 2}],
      a: [9, 8],
      v: [{k: 1, l: [2]}, {k: 2}],
      b: [5, 4]
    }, 'hash join data with object keys');

    const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v));

    tableEqual(tj2, {
      u: [{k: 1, l: [2]}, {k: 2}],
      a: [9, 8],
      v: [{k: 1, l: [2]}, {k: 2}],
      b: [5, 4]
    }, 'loop join data with object keys');
  });

  it('allows empty suffix', () => {
    const t1 = table({ k: [1, 2, 3], a: [3, 4, 1]});
    const t2 = table({ k: [1, 2, 3], a: [5, 6, 2]});

    const tj = t1.join(t2, ['k','k'], [all(), not('k')], { suffix: ['', '_2'] });

    tableEqual(tj,  {
      k: [1, 2, 3],
      a: [3, 4, 1],
      a_2: [5, 6, 2]
    }, 'join with empty suffix left');

    const tj2 = t1.join(t2, ['k','k'], [all(), not('k')], { suffix: ['_2', ''] });

    tableEqual(tj2,  {
      k: [1, 2, 3],
      a_2: [3, 4, 1],
      a: [5, 6, 2]
    }, 'join with empty suffix right');
  });
});

describe('join_left', () => {
  it('performs left outer join with predicate', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join_left(tr, (a, b) => a.k === b.u, {
      k: d => d.k,
      x: d => d.x,
      y: d => d.y,
      u: (a, b) => b.u,
      v: (a, b) => b.v,
      z: (a, b) => a.x + b.v
    });

    tableEqual(tj, {
      k: [ 'a', 'b', 'b', 'b', 'b', 'c' ],
      x: [ 1, 2, 2, 3, 3, 4 ],
      y: [ 9, 8, 8, 7, 7, 6 ],
      u: [ 'a', 'b', 'b', 'b', 'b', undefined ],
      v: [ 4, 5, 6, 5, 6, undefined ],
      z: [ 5, 7, 8, 8, 9, NaN ]
    }, 'left join data');
  });

  it('performs left outer join with keys', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join_left(tr, ['k', 'u'], [all(), not('u')]);

    tableEqual(tj, {
      k: [ 'a', 'b', 'b', 'b', 'b', 'c' ],
      x: [ 1, 2, 2, 3, 3, 4 ],
      y: [ 9, 8, 8, 7, 7, 6 ],
      v: [ 4, 5, 6, 5, 6, undefined ]
    }, 'left join data');
  });
});

describe('join_right', () => {
  it('performs right outer join with predicate', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join_right(tr, (a, b) => a.k === b.u, {
      k: d => d.k,
      x: d => d.x,
      y: d => d.y,
      u: (a, b) => b.u,
      v: (a, b) => b.v,
      z: (a, b) => a.x + b.v
    });

    tableEqual(tj, {
      k: [ 'a', 'b', 'b', 'b', 'b', undefined ],
      x: [ 1, 2, 2, 3, 3, undefined ],
      y: [ 9, 8, 8, 7, 7, undefined ],
      u: [ 'a', 'b', 'b', 'b', 'b', 'd' ],
      v: [ 4, 5, 6, 5, 6, 0 ],
      z: [ 5, 7, 8, 8, 9, NaN ]
    }, 'right join data');
  });

  it('performs right outer join with keys', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join_right(tr, ['k', 'u'], [not('k'), all()]);

    tableEqual(tj, {
      x: [ 1, 2, 2, 3, 3, undefined ],
      y: [ 9, 8, 8, 7, 7, undefined ],
      u: [ 'a', 'b', 'b', 'b', 'b', 'd' ],
      v: [ 4, 5, 6, 5, 6, 0 ]
    }, 'right join data');
  });
});

describe('join_full', () => {
  it('performs full outer join with keys', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join_full(tr, ['k', 'u'], [all(), all()]);

    tableEqual(tj,  {
      k: [ 'a', 'b', 'b', 'b', 'b', 'c', undefined ],
      x: [ 1, 2, 2, 3, 3, 4, undefined ],
      y: [ 9, 8, 8, 7, 7, 6, undefined ],
      u: [ 'a', 'b', 'b', 'b', 'b', undefined, 'd' ],
      v: [ 4, 5, 6, 5, 6, undefined, 0 ]
    }, 'full join data');
  });

  it('performs full outer join with predicate', () => {
    const [tl, tr] = joinTables();

    const tj = tl.join_full(tr, (a, b) => a.k === b.u, {
      k: d => d.k,
      x: d => d.x,
      y: d => d.y,
      u: (a, b) => b.u,
      v: (a, b) => b.v,
      z: (a, b) => a.x + b.v
    });

    tableEqual(tj,  {
      k: [ 'a', 'b', 'b', 'b', 'b', 'c', undefined ],
      x: [ 1, 2, 2, 3, 3, 4, undefined ],
      y: [ 9, 8, 8, 7, 7, 6, undefined ],
      u: [ 'a', 'b', 'b', 'b', 'b', undefined, 'd' ],
      v: [ 4, 5, 6, 5, 6, undefined, 0 ],
      z: [ 5, 7, 8, 8, 9, NaN, NaN ]
    }, 'full join data');
  });
});

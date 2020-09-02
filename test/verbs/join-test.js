import tape from 'tape';
import tableEqual from '../table-equal';
import { all, not, op, table } from '../../src/verbs';

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

tape('cross computes Cartesian product', t => {
  const [tl, tr] = joinTables();

  const tj = tl.cross(tr);

  t.equal(tj.numRows(), tl.numRows() * tr.numRows());
  tableEqual(t, tj,  {
    k: [ 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c' ],
    x: [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4 ],
    y: [ 9, 9, 9, 9, 8, 8, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6 ],
    u: [ 'b', 'a', 'b', 'd', 'b', 'a', 'b', 'd', 'b', 'a', 'b', 'd', 'b', 'a', 'b', 'd' ],
    v: [ 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0 ]
  }, 'cross data');

  t.end();
});

tape('cross computes Cartesian product with column selection', t => {
  const [tl, tr] = joinTables();

  const tj = tl.cross(tr, [not('y'), not('u')]);

  t.equal(tj.numRows(), tl.numRows() * tr.numRows());
  tableEqual(t, tj,  {
    k: [ 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c' ],
    x: [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4 ],
    v: [ 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0 ]
  }, 'selected cross data');

  t.end();
});

tape('cross computes Cartesian product with column renaming', t => {
  const [tl, tr] = joinTables();

  const tj = tl.cross(tr, [
    {j: d => d.k, z: d => d.x},
    {w: d => d.v}
  ]);

  t.equal(tj.numRows(), tl.numRows() * tr.numRows());
  tableEqual(t, tj,  {
    j: [ 'a', 'a', 'a', 'a', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'b', 'c', 'c', 'c', 'c' ],
    z: [ 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4 ],
    w: [ 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0, 5, 4, 6, 0 ]
  }, 'selected cross data');

  t.end();
});

tape('join performs natural join', t => {
  const tl = table({ k: [1, 2], a: [3, 4]});
  const tr = table({ k: [1, 2], b: [5, 6]});

  const tj = tl.join(tr);

  tableEqual(t, tj, {
    k_1: [ 1, 2 ],
    a: [ 3, 4 ],
    k_2: [ 1, 2 ],
    b: [ 5, 6 ]
  }, 'natural join data');

  t.end();
});

tape('join performs inner join with predicate', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join(tr, (a, b) => a.k === b.u, {
    k: d => d.k,
    x: d => d.x,
    y: d => d.y,
    u: (a, b) => b.u,
    v: (a, b) => b.v,
    z: (a, b) => a.x + b.v
  });

  tableEqual(t, tj, {
    k: [ 'a', 'b', 'b', 'b', 'b' ],
    x: [ 1, 2, 2, 3, 3 ],
    y: [ 9, 8, 8, 7, 7 ],
    u: [ 'a', 'b', 'b', 'b', 'b' ],
    v: [ 4, 5, 6, 5, 6 ],
    z: [ 5, 7, 8, 8, 9 ]
  }, 'inner join data');

  t.end();
});

tape('join_left performs left outer join with predicate', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join_left(tr, (a, b) => a.k === b.u, {
    k: d => d.k,
    x: d => d.x,
    y: d => d.y,
    u: (a, b) => b.u,
    v: (a, b) => b.v,
    z: (a, b) => a.x + b.v
  });

  tableEqual(t, tj, {
    k: [ 'a', 'b', 'b', 'b', 'b', 'c' ],
    x: [ 1, 2, 2, 3, 3, 4 ],
    y: [ 9, 8, 8, 7, 7, 6 ],
    u: [ 'a', 'b', 'b', 'b', 'b', undefined ],
    v: [ 4, 5, 6, 5, 6, undefined ],
    z: [ 5, 7, 8, 8, 9, NaN ]
  }, 'left join data');

  t.end();
});

tape('join_right performs right outer join with predicate', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join_right(tr, (a, b) => a.k === b.u, {
    k: d => d.k,
    x: d => d.x,
    y: d => d.y,
    u: (a, b) => b.u,
    v: (a, b) => b.v,
    z: (a, b) => a.x + b.v
  });

  tableEqual(t, tj, {
    k: [ 'a', 'b', 'b', 'b', 'b', undefined ],
    x: [ 1, 2, 2, 3, 3, undefined ],
    y: [ 9, 8, 8, 7, 7, undefined ],
    u: [ 'a', 'b', 'b', 'b', 'b', 'd' ],
    v: [ 4, 5, 6, 5, 6, 0 ],
    z: [ 5, 7, 8, 8, 9, NaN ]
  }, 'right join data');

  t.end();
});

tape('join_full performs full outer join with predicate', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join_full(tr, (a, b) => a.k === b.u, {
    k: d => d.k,
    x: d => d.x,
    y: d => d.y,
    u: (a, b) => b.u,
    v: (a, b) => b.v,
    z: (a, b) => a.x + b.v
  });

  tableEqual(t, tj,  {
    k: [ 'a', 'b', 'b', 'b', 'b', 'c', undefined ],
    x: [ 1, 2, 2, 3, 3, 4, undefined ],
    y: [ 9, 8, 8, 7, 7, 6, undefined ],
    u: [ 'a', 'b', 'b', 'b', 'b', undefined, 'd' ],
    v: [ 4, 5, 6, 5, 6, undefined, 0 ],
    z: [ 5, 7, 8, 8, 9, NaN, NaN ]
  }, 'full join data');

  t.end();
});

tape('join performs inner join with keys', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join(tr, ['k', 'u'], [all(), not('u')]);

  tableEqual(t, tj, {
    k: [ 'a', 'b', 'b', 'b', 'b' ],
    x: [ 1, 2, 2, 3, 3 ],
    y: [ 9, 8, 8, 7, 7 ],
    v: [ 4, 5, 6, 5, 6 ]
  }, 'inner join data');

  t.end();
});

tape('join_left performs left outer join with keys', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join_left(tr, ['k', 'u'], [all(), not('u')]);

  tableEqual(t, tj, {
    k: [ 'a', 'b', 'b', 'b', 'b', 'c' ],
    x: [ 1, 2, 2, 3, 3, 4 ],
    y: [ 9, 8, 8, 7, 7, 6 ],
    v: [ 4, 5, 6, 5, 6, undefined ]
  }, 'left join data');

  t.end();
});

tape('join_right performs right outer join with keys', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join_right(tr, ['k', 'u'], [not('k'), all()]);

  tableEqual(t, tj, {
    x: [ 1, 2, 2, 3, 3, undefined ],
    y: [ 9, 8, 8, 7, 7, undefined ],
    u: [ 'a', 'b', 'b', 'b', 'b', 'd' ],
    v: [ 4, 5, 6, 5, 6, 0 ]
  }, 'right join data');

  t.end();
});

tape('join_full performs full outer join with keys', t => {
  const [tl, tr] = joinTables();

  const tj = tl.join_full(tr, ['k', 'u'], [all(), all()]);

  tableEqual(t, tj,  {
    k: [ 'a', 'b', 'b', 'b', 'b', 'c', undefined ],
    x: [ 1, 2, 2, 3, 3, 4, undefined ],
    y: [ 9, 8, 8, 7, 7, 6, undefined ],
    u: [ 'a', 'b', 'b', 'b', 'b', undefined, 'd' ],
    v: [ 4, 5, 6, 5, 6, undefined, 0 ]
  }, 'full join data');

  t.end();
});

tape('join handles column name collisions', t => {
  const [tl] = joinTables();
  const tr = table({ k: ['a', 'b'], x: [9, 8] });

  const tj1 = tl.join(tr, ['k', 'k'], [all(), all()]);

  tableEqual(t, tj1, {
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

  tableEqual(t, tj2, {
    k_1: [ 'a', 'b', 'b' ],
    x_1: [ 1, 2, 3 ],
    k_2: [ 'a', 'b', 'b' ],
    x_2: [ 9, 8, 8 ],
    y: [ 10, 10, 11 ]
  }, 'name override join data');

  t.end();
});

tape('join does not treat null values as equal', t => {
  const tl = table({ u: ['a', null, undefined, NaN], a: [1, 2, 3, 4] });
  const tr = table({ v: [null, undefined, NaN, 'a'], b: [9, 8, 7, 6] });

  const tj1 = tl.join(tr, ['u', 'v'], [all(), all()]);

  tableEqual(t, tj1, {
    u: [ 'a' ],
    v: [ 'a' ],
    a: [ 1 ],
    b: [ 6 ]
  }, 'null join data with keys');

  const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v), [all(), all()]);

  tableEqual(t, tj2, {
    u: [ 'a' ],
    v: [ 'a' ],
    a: [ 1 ],
    b: [ 6 ]
  }, 'null join data with equal predicate');

  t.end();
});

tape('join supports date-valued keys', t => {
  const d1 = new Date(2000, 0, 1);
  const d2 = new Date(2012, 1, 3);
  const tl = table({ u: [d1, d2, null], a: [9, 8, 7] });
  const tr = table({ v: [new Date(+d1), +d2], b: [5, 4] });

  const tj1 = tl.join(tr, ['u', 'v'], [all(), not('v')]);

  tableEqual(t, tj1, {
    u: [d1, d2],
    a: [9, 8],
    b: [5, 4]
  }, 'hash join data with date keys');

  const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v), [all(), not('v')]);

  tableEqual(t, tj2, {
    u: [d1, d2],
    a: [9, 8],
    b: [5, 4]
  }, 'loop join data with date keys');

  t.end();
});

tape('join supports regexp-valued keys', t => {
  const tl = table({ u: [/foo/g, /bar.*/i, null], a: [9, 8, 7] });
  const tr = table({ v: [/foo/g, /bar.*/i], b: [5, 4] });

  const tj1 = tl.join(tr, ['u', 'v'], [all(), not('v')]);

  tableEqual(t, tj1, {
    u: [/foo/g, /bar.*/i],
    a: [9, 8],
    b: [5, 4]
  }, 'hash join data with regexp keys');

  const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v), [all(), not('v')]);

  tableEqual(t, tj2, {
    u: [/foo/g, /bar.*/i],
    a: [9, 8],
    b: [5, 4]
  }, 'loop join data with regexp keys');

  t.end();
});

tape('join supports array-valued keys', t => {
  const tl = table({ u: [[1, 2], [3, 4], null], a: [9, 8, 7] });
  const tr = table({ v: [[1, 2], [3, 4]], b: [5, 4] });

  const tj1 = tl.join(tr, ['u', 'v']);

  tableEqual(t, tj1, {
    u: [[1, 2], [3, 4]],
    a: [9, 8],
    v: [[1, 2], [3, 4]],
    b: [5, 4]
  }, 'hash join data with array keys');

  const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v));

  tableEqual(t, tj2, {
    u: [[1, 2], [3, 4]],
    a: [9, 8],
    v: [[1, 2], [3, 4]],
    b: [5, 4]
  }, 'loop join data with array keys');

  t.end();
});

tape('join supports object-valued keys', t => {
  const tl = table({ u: [{k: 1, l: [2]}, {k: 2}, null], a: [9, 8, 7] });
  const tr = table({ v: [{k: 1, l: [2]}, {k: 2}], b: [5, 4] });

  const tj1 = tl.join(tr, ['u', 'v']);

  tableEqual(t, tj1, {
    u: [{k: 1, l: [2]}, {k: 2}],
    a: [9, 8],
    v: [{k: 1, l: [2]}, {k: 2}],
    b: [5, 4]
  }, 'hash join data with object keys');

  const tj2 = tl.join(tr, (a, b) => op.equal(a.u, b.v));

  tableEqual(t, tj2, {
    u: [{k: 1, l: [2]}, {k: 2}],
    a: [9, 8],
    v: [{k: 1, l: [2]}, {k: 2}],
    b: [5, 4]
  }, 'loop join data with object keys');

  t.end();
});
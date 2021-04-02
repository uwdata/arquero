import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src';

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

tape('semijoin uses natural join criteria', t => {
  const tl = table({ k: [1, 2, 3], a: [3, 4, 0]});
  const tr = table({ k: [1, 2], b: [5, 6]});

  const tj = tl.semijoin(tr);

  tableEqual(t, tj, {
    k: [ 1, 2 ],
    a: [ 3, 4 ]
  }, 'natural semijoin data');

  t.end();
});

tape('semijoin filters left table to matching rows', t => {
  const [tl, tr] = joinTables();
  const output = {
    k: [ 'a', 'b', 'b' ],
    x: [ 1, 2, 3 ],
    y: [ 9, 8, 7 ]
  };

  tableEqual(t,
    tl.semijoin(tr, ['k', 'u']),
    output,
    'semijoin data, with keys'
  );

  tableEqual(t,
    tl.semijoin(tr, (a, b) => a.k === b.u),
    output,
    'semijoin data, with predicate'
  );

  t.end();
});

tape('antijoin uses natural join criteria', t => {
  const tl = table({ k: [1, 2, 3], a: [3, 4, 0]});
  const tr = table({ k: [1, 2], b: [5, 6]});

  const tj = tl.antijoin(tr);

  tableEqual(t, tj, {
    k: [ 3 ],
    a: [ 0 ]
  }, 'natural antijoin data');

  t.end();
});

tape('antijoin filters left table to non-matching rows', t => {
  const [tl, tr] = joinTables();
  const output = {
    k: [ 'c' ],
    x: [ 4 ],
    y: [ 6 ]
  };

  tableEqual(t,
    tl.antijoin(tr, ['k', 'u']),
    output,
    'antijoin data, with keys'
  );

  tableEqual(t,
    tl.antijoin(tr, (a, b) => a.k === b.u),
    output,
    'antijoin data, with predicate'
  );

  t.end();
});

tape('except returns table given empty input', t => {
  const data = { k: [1, 2, 3], a:  [3, 4, 0] };
  const tl = table(data);
  tableEqual(t, tl.except([]), data, 'except data');
  t.end();
});

tape('except removes intersecting rows', t => {
  const tl = table({ k: [1, 2, 3], a: [3, 4, 0]});
  const tr = table({ k: [1, 2], a: [3, 4]});

  tableEqual(t, tl.except(tr), {
    k: [ 3 ],
    a: [ 0 ]
  }, 'except data');

  t.end();
});

tape('except removes intersecting rows for multiple tables', t => {
  const t0 = table({ k: [1, 2, 3], a: [3, 4, 0] });
  const t1 = table({ k: [1], a: [3]});
  const t2 = table({ k: [2], a: [4]});

  tableEqual(t, t0.except(t1, t2), {
    k: [ 3 ],
    a: [ 0 ]
  }, 'except data');

  t.end();
});

tape('intersect returns empty table given empty input', t => {
  const tl = table({ k: [1, 2, 3], a: [3, 4, 0] });

  tableEqual(t, tl.intersect([]), {
    k: [ ],
    a: [ ]
  }, 'intersect data');

  t.end();
});

tape('intersect removes non-intersecting rows', t => {
  const tl = table({ k: [1, 2, 3], a: [3, 4, 0] });
  const tr = table({ k: [1, 2], a: [3, 4]});

  tableEqual(t, tl.intersect(tr), {
    k: [ 1, 2 ],
    a: [ 3, 4 ]
  }, 'intersect data');

  t.end();
});

tape('intersect removes non-intersecting rows for multiple tables', t => {
  const t0 = table({ k: [1, 2, 3], a: [3, 4, 0] });
  const t1 = table({ k: [1], a: [3]});
  const t2 = table({ k: [2], a: [4]});

  tableEqual(t, t0.intersect(t1, t2), {
    k: [ ],
    a: [ ]
  }, 'intersect data');

  t.end();
});
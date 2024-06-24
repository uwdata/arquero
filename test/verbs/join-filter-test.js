import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';

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

describe('semijoin', () => {
  it('uses natural join criteria', () => {
    const tl = table({ k: [1, 2, 3], a: [3, 4, 0]});
    const tr = table({ k: [1, 2], b: [5, 6]});

    const tj = tl.semijoin(tr);

    tableEqual(tj, {
      k: [ 1, 2 ],
      a: [ 3, 4 ]
    }, 'natural semijoin data');
  });

  it('filters left table to matching rows', () => {
    const [tl, tr] = joinTables();
    const output = {
      k: [ 'a', 'b', 'b' ],
      x: [ 1, 2, 3 ],
      y: [ 9, 8, 7 ]
    };

    tableEqual(
      tl.semijoin(tr, ['k', 'u']),
      output,
      'semijoin data, with keys'
    );

    tableEqual(
      tl.semijoin(tr, (a, b) => a.k === b.u),
      output,
      'semijoin data, with predicate'
    );
  });
});

describe('antijoin', () => {
  it('uses natural join criteria', () => {
    const tl = table({ k: [1, 2, 3], a: [3, 4, 0]});
    const tr = table({ k: [1, 2], b: [5, 6]});

    const tj = tl.antijoin(tr);

    tableEqual(tj, {
      k: [ 3 ],
      a: [ 0 ]
    }, 'natural antijoin data');
  });

  it('filters left table to non-matching rows', () => {
    const [tl, tr] = joinTables();
    const output = {
      k: [ 'c' ],
      x: [ 4 ],
      y: [ 6 ]
    };

    tableEqual(
      tl.antijoin(tr, ['k', 'u']),
      output,
      'antijoin data, with keys'
    );

    tableEqual(
      tl.antijoin(tr, (a, b) => a.k === b.u),
      output,
      'antijoin data, with predicate'
    );
  });
});

describe('except', () => {
  it('returns table given empty input', () => {
    const data = { k: [1, 2, 3], a:  [3, 4, 0] };
    const tl = table(data);
    tableEqual(tl.except([]), data, 'except data');
  });

  it('removes intersecting rows', () => {
    const tl = table({ k: [1, 2, 3], a: [3, 4, 0]});
    const tr = table({ k: [1, 2], a: [3, 4]});

    tableEqual(tl.except(tr), {
      k: [ 3 ],
      a: [ 0 ]
    }, 'except data');
  });

  it('removes intersecting rows for multiple tables', () => {
    const t0 = table({ k: [1, 2, 3], a: [3, 4, 0] });
    const t1 = table({ k: [1], a: [3]});
    const t2 = table({ k: [2], a: [4]});

    tableEqual(t0.except(t1, t2), {
      k: [ 3 ],
      a: [ 0 ]
    }, 'except data');
  });
});

describe('intersect', () => {
  it('returns empty table given empty input', () => {
    const tl = table({ k: [1, 2, 3], a: [3, 4, 0] });

    tableEqual(tl.intersect([]), {
      k: [ ],
      a: [ ]
    }, 'intersect data');
  });

  it('removes non-intersecting rows', () => {
    const tl = table({ k: [1, 2, 3], a: [3, 4, 0] });
    const tr = table({ k: [1, 2], a: [3, 4]});

    tableEqual(tl.intersect(tr), {
      k: [ 1, 2 ],
      a: [ 3, 4 ]
    }, 'intersect data');
  });

  it('removes non-intersecting rows for multiple tables', () => {
    const t0 = table({ k: [1, 2, 3], a: [3, 4, 0] });
    const t1 = table({ k: [1], a: [3]});
    const t2 = table({ k: [2], a: [4]});

    tableEqual(t0.intersect(t1, t2), {
      k: [ ],
      a: [ ]
    }, 'intersect data');
  });
});

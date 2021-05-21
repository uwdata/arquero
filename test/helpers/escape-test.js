import tape from 'tape';
import tableEqual from '../table-equal';
import { escape, query, table } from '../../src';

tape('derive supports escaped functions', t => {
  const dt = table({ a: [1, 2], b: [3, 4] });
  const sq = x => x * x;
  const off = 1;

  tableEqual(t,
    dt.derive({ z: escape(d => sq(d.a) + off) }),
    { a: [1, 2], b: [3, 4], z: [2, 5] },
    'derive data with escape'
  );

  tableEqual(t,
    dt.derive({ z: escape(d => d.a * -d.b + off) }),
    { a: [1, 2], b: [3, 4], z: [-2, -7] },
    'derive data with escape, two columns'
  );

  t.end();
});

tape('filter supports escaped functions', t => {
  const thresh = 5;
  tableEqual(t,
    table({ a: [1, 4, 9], b: [1, 2, 3] }).filter(escape(d => d.a < thresh)),
    { a: [1, 4], b: [1, 2] },
    'filter data with escape'
  );

  t.end();
});

tape('spread supports escaped functions', t => {
  const pair = d => [d.v, d.v * d.v + 1];

  tableEqual(t,
    table({ v: [3, 2, 1] }).spread({ v: escape(pair) }, { as: ['a', 'b'] }),
    { a: [3, 2, 1], b: [10, 5, 2] },
    'spread data with escape'
  );

  t.end();
});

tape('groupby supports escaped functions', t => {
  tableEqual(t,
    table({ v: [3, 2, 1] }).groupby({ g: escape(d => -d.v) }).count(),
    { g: [-3, -2, -1], count: [1, 1, 1] },
    'groupby data with escape'
  );

  t.end();
});

tape('orderby supports escaped functions', t => {
  tableEqual(t,
    table({ v: [1, 2, 3] }).orderby(escape(d => -d.v)),
    { v: [3, 2, 1] },
    'orderby data with escape'
  );

  t.end();
});

tape('query serialization throws for escaped functions', t => {
  const sq = d => d.a * d.a;

  t.throws(
    () => query().derive({ z: escape(sq) }).toObject(),
    'query toObject throws on escaped function'
  );

  t.throws(
    () => query().derive({ z: escape(sq) }).toAST(),
    'query toAST throws on escape function'
  );

  t.end();
});
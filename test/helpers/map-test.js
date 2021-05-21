import tape from 'tape';
import tableEqual from '../table-equal';
import { all, map, query, table } from '../../src';

tape('derive supports map functions', t => {
  const dt = table({ a: [1, 2], b: [3, 4] });
  const sq = x => x * x;
  const off = 1;

  tableEqual(t,
    dt.derive({ z: map('a', a => sq(a) + off) }),
    { a: [1, 2], b: [3, 4], z: [2, 5] },
    'derive data with map'
  );

  tableEqual(t,
    dt.derive({ z: map(['a', 'b'], (a, b) => a * -b + off) }),
    { a: [1, 2], b: [3, 4], z: [-2, -7] },
    'derive data with map, two input columns'
  );

  tableEqual(t,
    dt.derive({ z: map(['a', 'b'], (...v) => v[0] * -v[1] + off) }),
    { a: [1, 2], b: [3, 4], z: [-2, -7] },
    'derive data with map, rest arguments'
  );

  tableEqual(t,
    dt.derive({ z: map(all(), (a, b) => a * -b + off) }),
    { a: [1, 2], b: [3, 4], z: [-2, -7] },
    'derive data with map, column selection'
  );

  t.end();
});

tape('filter supports map functions', t => {
  const thresh = 5;
  tableEqual(t,
    table({ a: [1, 4, 9], b: [1, 2, 3] }).filter(map('a', a => a < thresh)),
    { a: [1, 4], b: [1, 2] },
    'filter data with map'
  );

  t.end();
});

tape('spread supports map functions', t => {
  const pair = x => [x, x * x + 1];

  tableEqual(t,
    table({ v: [3, 2, 1] }).spread({ v: map('v', pair) }, { as: ['a', 'b'] }),
    { a: [3, 2, 1], b: [10, 5, 2] },
    'spread data with map'
  );

  t.end();
});

tape('query serialization throws for map functions', t => {
  const sq = x => x * x;

  t.throws(
    () => query().derive({ z: map('a', sq) }).toObject(),
    'query toObject throws on map function'
  );

  t.throws(
    () => query().derive({ z: map('a', sq) }).toAST(),
    'query toAST throws on map function'
  );

  t.end();
});
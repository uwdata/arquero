import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src/table';
import { fromArrow, toArrow } from '../../src';

tape('reify materializes filtered and ordered tables', t => {
  const dt = table({
    a: [5, 4, 3, 2, 1],
    b: [1, 1, 0, 0, 1]
  });

  const rt = dt.filter(d => d.b)
    .orderby('a')
    .reify();

  tableEqual(t, rt,
    { a: [1, 4, 5], b: [1, 1, 1] },
    'reify data'
  );

  t.end();
});

tape('reify preserves binary data', t => {
  const data = [
    { a: 1.0, b: 'a', c: [1], d: new Date(2000, 0, 1, 1) },
    { a: 1.3, b: 'b', c: [2], d: new Date(2001, 1, 1, 2) },
    { a: 1.5, b: 'c', c: [3], d: new Date(2002, 2, 1, 3) },
    { a: 1.7, b: 'd', c: [4], d: new Date(2003, 3, 1, 4) }
  ];

  const dt = fromArrow(toArrow(data));
  const rt = dt.filter(d => d.b !== 'c').reify();

  tableEqual(t, rt,
    {
      a: [1.0, 1.3, 1.7],
      b: ['a', 'b', 'd'],
      c: [[1], [2], [4]],
      d: [
        new Date(2000, 0, 1, 1),
        new Date(2001, 1, 1, 2),
        new Date(2003, 3, 1, 4)
      ]
    },
    'reify data'
  );

  t.end();
});
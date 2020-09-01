import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src/verbs';

tape('filter filters a table', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols).filter(d => 1 < d.a && d.a < 7).reify();

  t.equal(ft.numRows(), 2, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  tableEqual(t, ft, { a: [3, 5], b: [4, 6] }, 'filtered data');
  t.end();
});

tape('filter filters a filtered table', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols)
    .filter(d => 1 < d.a)
    .filter(d => d.a < 7)
    .reify();

  t.equal(ft.numRows(), 2, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  tableEqual(t, ft, { a: [3, 5], b: [4, 6] }, 'filter data');
  t.end();
});

tape('filter supports aggregate functions', t => {
  const cols = { a: [1, 3, 5, 7], b: [2, 4, 6, 8] };
  const ft = table(cols).filter(({ a }) => a < op.median(a)).reify();
  tableEqual(t, ft, { a: [1, 3], b: [2, 4] }, 'filter data');
  t.end();
});

tape('filter supports window functions', t => {
  const cols = { a: [1, 3, 5, 7], b: [2, 4, 6, 8]};
  const ft = table(cols).filter(({ a }) => op.lag(a) > 2).reify();
  tableEqual(t, ft, { a: [5, 7], b: [6, 8] }, 'filter data');
  t.end();
});
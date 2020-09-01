import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src/verbs';

tape('union combines tables', t => {
  const t1 = table({ a: [1, 2], b: [3, 4] });
  const t2 = table({ a: [3, 4], c: [5, 6] });
  const dt = t1.union(t2);

  t.equal(dt.numRows(), 4, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, {
    a: [1, 2, 3, 4],
    b: [3, 4, undefined, undefined]
  }, 'union data');
  t.end();
});

tape('union combines multiple tables', t => {
  const t1 = table({ a: [1, 2], b: [3, 4] });
  const t2 = table({ a: [3, 4], c: [5, 6] });
  const t3 = table({ a: [5, 6], b: [7, 8] });

  const dt = t1.union(t2, t3);
  t.equal(dt.numRows(), 6, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, {
    a: [1, 2, 3, 4, 5, 6],
    b: [3, 4, undefined, undefined, 7, 8]
  }, 'union data');

  const at = t1.union([t2, t3]);
  t.equal(at.numRows(), 6, 'num rows');
  t.equal(at.numCols(), 2, 'num cols');
  tableEqual(t, at, {
    a: [1, 2, 3, 4, 5, 6],
    b: [3, 4, undefined, undefined, 7, 8]
  }, 'union data');

  t.end();
});

tape('union deduplicates combined data', t => {
  const t1 = table({ a: [1, 2], b: [3, 4] });
  const t2 = table({ a: [1, 2], b: [3, 6] });
  const dt = t1.union(t2);

  t.equal(dt.numRows(), 3, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, {
    a: [1, 2, 2],
    b: [3, 4, 6]
  }, 'union data');

  const t3 = table({ a: [1, 1], b: [5, 5] });
  const ut = t1.union(t3);

  t.equal(ut.numRows(), 3, 'num rows');
  t.equal(ut.numCols(), 2, 'num cols');
  tableEqual(t, ut, {
    a: [1, 2, 1],
    b: [3, 4, 5]
  }, 'union data');
  t.end();
});
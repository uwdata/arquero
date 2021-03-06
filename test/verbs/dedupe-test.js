import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src';

tape('dedupe de-duplicates table', t => {
  const dt = table({ a: [1, 2, 1, 2, 1], b: [3, 4, 3, 4, 5] })
    .dedupe();

  t.equal(dt.numRows(), 3, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, {
    a: [1, 2, 1],
    b: [3, 4, 5]
  }, 'dedupe data');
  t.equal(dt.isGrouped(), false, 'dedupe not grouped');
  t.end();
});

tape('dedupe de-duplicates table based on keys', t => {
  const dt = table({ a: [1, 2, 1, 2, 1], b: [3, 4, 3, 4, 5] })
    .dedupe('a');

  t.equal(dt.numRows(), 2, 'num rows');
  t.equal(dt.numCols(), 2, 'num cols');
  tableEqual(t, dt, {
    a: [1, 2],
    b: [3, 4]
  }, 'dedupe data');
  t.equal(dt.isGrouped(), false, 'dedupe not grouped');
  t.end();
});
import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src/verbs';

tape('lookup retrieves values from lookup table with string values', t => {
  const right = table({
    key: [1, 2, 3],
    u: ['a', 'b', 'c'],
    v: [5, 3, 1]
  });

  const left = table({
    id: [1, 2, 3, 4, 1]
  });

  const lt = left.lookup(right, ['id', 'key'], ['u', 'v']);

  t.equal(lt.numRows(), 5, 'num rows');
  t.equal(lt.numCols(), 3, 'num cols');

  tableEqual(t, lt, {
    id: [1, 2, 3, 4, 1],
    u: ['a', 'b', 'c', undefined, 'a'],
    v: [5, 3, 1, undefined, 5]
  }, 'lookup data');
  t.end();
});

tape('lookup retrieves values from lookup table with function values', t => {
  const right = table({
    key: [1, 2, 3],
    u: ['a', 'b', 'c'],
    v: [5, 3, 1]
  });

  const left = table({
    id: [1, 2, 3, 4, 1]
  });

  const lt = left.lookup(right, ['id', 'key'], {
    u: d => d.u,
    v: d => d.v - op.mean(d.v)
  });

  t.equal(lt.numRows(), 5, 'num rows');
  t.equal(lt.numCols(), 3, 'num cols');

  tableEqual(t, lt, {
    id: [1, 2, 3, 4, 1],
    u: ['a', 'b', 'c', undefined, 'a'],
    v: [2, 0, -2, undefined, 2]
  }, 'lookup data');
  t.end();
});
import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src/verbs';

const na = undefined;

tape('fulfill imputes rows for an ungrouped table', t => {
  const dt = table({
      x: ['a', 'b', 'c'],
      y: [1, 2, 3],
      z: ['x', 'x', 'x']
    })
    .fulfill('x', 'y')
    .orderby('x', 'y')
    .reify();

  tableEqual(t, dt, {
    x: ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'],
    y: [ 1,   2,   3,   1,   2,   3,   1,   2,   3 ],
    z: ['x', na,  na,  na, 'x',  na,  na,  na, 'x']
  }, 'complete data');

  t.end();
});

tape('fulfill imputes rows for a grouped table', t => {
  const dt = table({
      x: ['a', 'b', 'c'],
      y: [1, 2, 3],
      z: ['x', 'y', 'z'],
      v: [9, 8, 7]
    })
    .groupby('x', 'y')
    .fulfill('z')
    .orderby('x', 'y', 'z')
    .reify();

  tableEqual(t, dt, {
    x: ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'],
    y: [ 1,   1,   1,   2,   2,   2,   3,   3,   3 ],
    z: ['x', 'y', 'z', 'x', 'y', 'z', 'x', 'y', 'z'],
    v: [ 9,   na,  na,  na,  8,   na,  na,  na,  7 ]
  }, 'complete data');

  t.end();
});
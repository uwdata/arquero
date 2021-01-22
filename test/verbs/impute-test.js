import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src';

const na = undefined;

tape('impute imputes values for an ungrouped table', t => {
  const dt = table({ x: [1, null, NaN, undefined, 3] });

  tableEqual(t,
    dt.impute({ x: () => 2 }),
    { x: [1, 2, 2, 2, 3] },
    'impute data, constant'
  );

  tableEqual(t,
    dt.impute({ x: op.mean('x') }),
    { x: [1, 2, 2, 2, 3] },
    'impute data, mean'
  );

  t.end();
});

tape('impute imputes values for a grouped table', t => {
  const dt = table({
    k: [0, 0, 0, 0, 1, 1, 1, 1],
    x: [1, null, NaN, 3, 3, null, undefined, 5]
  }).groupby('k');

  const t1 = dt.impute({ x: () => 2 });
  tableEqual(t, t1, {
    k: [0, 0, 0, 0, 1, 1, 1, 1],
    x: [1, 2, 2, 3, 3, 2, 2, 5]
  }, 'impute data, constant');

  t.equal(dt.groups(), t1.groups(), 'groups');

  const t2 = dt.impute({ x: op.mean('x') });
  tableEqual(t, t2, {
    k: [0, 0, 0, 0, 1, 1, 1, 1],
    x: [1, 2, 2, 3, 3, 4, 4, 5]
  }, 'impute data, mean');

  t.equal(dt.groups(), t2.groups(), 'groups');

  t.end();
});

tape('impute imputes expanded rows for an ungrouped table', t => {
  const dt = table({
      x: ['a', 'b', 'c'],
      y: [1, 2, 3],
      z: ['x', 'x', 'x']
    })
    .impute(null, { expand: ['x', 'y'] })
    .orderby('x', 'y')
    .reify();

  tableEqual(t, dt, {
    x: ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'],
    y: [ 1,   2,   3,   1,   2,   3,   1,   2,   3 ],
    z: ['x', na,  na,  na, 'x',  na,  na,  na, 'x']
  }, 'impute data');

  t.equal(dt.groups(), null, 'no groups');

  t.end();
});

tape('imputes imputes expanded rows for a grouped table', t => {
  const dt = table({
      x: ['a', 'a', 'b', 'c'],
      y: [1, 1, 2, 3],
      z: ['x', 'x', 'y', 'z'],
      v: [0, 9, 8, 7]
    })
    .groupby('x', 'y')
    .impute(null, { expand: 'z' })
    .orderby('x', 'y', 'z')
    .reify();

  tableEqual(t, dt, {
    x: ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'],
    y: [ 1,   1,   1,   1,   2,   2,   2,   3,   3,   3 ],
    z: ['x', 'x', 'y', 'z', 'x', 'y', 'z', 'x', 'y', 'z'],
    v: [ 0,   9,   na,  na,  na,  8,   na,  na,  na,  7 ]
  }, 'impute data');

  t.deepEqual(
    Array.from(dt.groups().keys),
    [0, 0, 0, 0, 1, 1, 1, 2, 2, 2],
    'group keys'
  );

  t.end();
});

tape('impute imputes values and rows for an ungrouped table', t => {
  const imp = 'imp';
  const dt = table({
      x: ['a', 'b', 'c'],
      y: [1, 2, 3],
      z: ['x', 'x', 'x']
    })
    .impute({ z: () => 'imp' }, { expand: ['x', 'y'] })
    .orderby('x', 'y')
    .reify();

  tableEqual(t, dt, {
    x: ['a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'],
    y: [ 1,   2,   3,   1,   2,   3,   1,   2,   3 ],
    z: ['x', imp, imp, imp, 'x', imp, imp, imp, 'x']
  }, 'impute data');

  t.equal(dt.groups(), null, 'no groups');

  t.end();
});

tape('imputes imputes expanded rows for a grouped table', t => {
  const dt = table({
      x: ['a', 'a', 'b', 'c'],
      y: [1, 1, 2, 3],
      z: ['x', 'x', 'y', 'z'],
      v: [0, 9, 8, 7]
    })
    .groupby('x', 'y')
    .impute({ v: op.max('v') }, { expand: 'z' })
    .orderby('x', 'y', 'z')
    .reify();

  tableEqual(t, dt, {
    x: ['a', 'a', 'a', 'a', 'b', 'b', 'b', 'c', 'c', 'c'],
    y: [ 1,   1,   1,   1,   2,   2,   2,   3,   3,   3 ],
    z: ['x', 'x', 'y', 'z', 'x', 'y', 'z', 'x', 'y', 'z'],
    v: [ 0,   9,   9,   9,   8,   8,   8,   7,   7,   7 ]
  }, 'impute data');

  t.deepEqual(
    Array.from(dt.groups().keys),
    [0, 0, 0, 0, 1, 1, 1, 2, 2, 2],
    'group keys'
  );

  t.end();
});

tape('impute throws on non-existent values column', t => {
  const dt = table({ x: [1, null, NaN, undefined, 3] });

  t.throws(() => dt.impute({ z: () => 1 }));

  t.end();
});
import tape from 'tape';
import { arrowDictionary } from '../arrow-stubs';
import { desc, op, table } from '../../src';
import { dictionaryColumn } from '../../src/table/dictionary-column';

tape('groupby computes groups based on field names', t => {
  const data = {
    k: 'aabb'.split(''),
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const gt = table(data).groupby('k');

  t.equal(gt.numRows(), 4, 'num rows');
  t.equal(gt.numCols(), 3, 'num cols');
  t.equal(gt.isGrouped(), true, 'is grouped');

  const { keys, names, rows, size } = gt.groups();
  t.deepEqual(
    { keys, names, rows, size },
    {
      keys: Uint32Array.from([0, 0, 1, 1]),
      names: ['k'],
      rows: [0, 2],
      size: 2
    },
    'group data'
  );
  t.end();
});

tape('groupby computes groups based on a function', t => {
  const data = {
    k: 'aabb'.split(''),
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const gt = table(data).groupby({ key: d => d.k });

  t.equal(gt.numRows(), 4, 'num rows');
  t.equal(gt.numCols(), 3, 'num cols');
  t.equal(gt.isGrouped(), true, 'is grouped');

  const { keys, names, rows, size } = gt.groups();
  t.deepEqual(
    { keys, names, rows, size },
    {
      keys: Uint32Array.from([0, 0, 1, 1]),
      names: ['key'],
      rows: [0, 2],
      size: 2
    },
    'group data'
  );
  t.end();
});

tape('groupby supports aggregate functions', t => {
  const data = { a: [1, 3, 5, 7] };
  const gt = table(data).groupby({ res: d => op.abs(d.a - op.mean(d.a)) });

  const { keys, names, rows, size } = gt.groups();
  t.deepEqual(
    { keys, names, rows, size },
    {
      keys: Uint32Array.from([0, 1, 1, 0]),
      names: ['res'],
      rows: [0, 1],
      size: 2
    },
    'group data'
  );
  t.end();
});

tape('groupby supports grouped aggregate functions', t => {
  const data = { k: [0, 0, 1, 1], a: [1, 3, 5, 7] };
  const gt = table(data)
    .groupby('k')
    .groupby({ res: d => d.a - op.mean(d.a) });

  const { keys, names, rows, size } = gt.groups();
  t.deepEqual(
    { keys, names, rows, size },
    {
      keys: Uint32Array.from([0, 1, 0, 1]),
      names: ['res'],
      rows: [0, 1],
      size: 2
    },
    'group data'
  );
  t.end();
});

tape('groupby throws on window functions', t => {
  const data = { a: [1, 3, 5, 7] };
  t.throws(() => table(data).groupby({ res: d => op.lag(d.a) }), 'no window');
  t.end();
});

tape('groupby persists after filter', t => {
  const dt = table({ a: [1, 3, 5, 7] })
    .groupby('a')
    .filter(d => d.a > 1);

  t.ok(dt.isGrouped(), 'is grouped');

  const { rows, get } = dt.groups();
  t.deepEqual(
    rows.map(r => get[0](r)),
    [3, 5, 7],
    'retrieves correct group values'
  );

  t.end();
});

tape('groupby persists after select', t => {
  const dt = table({ a: [1, 3, 5, 7], b: [2, 4, 6, 8] })
    .groupby('a')
    .select('b');

  t.ok(dt.isGrouped(), 'is grouped');

  const { rows, get } = dt.groups();
  t.deepEqual(
    rows.map(r => get[0](r)),
    [1, 3, 5, 7],
    'retrieves correct group values'
  );

  t.end();
});

tape('groupby persists after reify', t => {
  const dt = table({ a: [1, 3, 5, 7], b: [2, 4, 6, 8] })
    .groupby('a')
    .orderby(desc('b'))
    .filter(d => d.a > 1)
    .select('b')
    .reify();

  t.ok(dt.isGrouped(), 'is grouped');

  const { rows, get } = dt.groups();
  t.deepEqual(
    rows.map(r => get[0](r)),
    [3, 5, 7],
    'retrieves correct group values'
  );

  t.end();
});

tape('groupby optimizes Arrow dictionary columns', t => {
  const dt = table({
    d: dictionaryColumn(arrowDictionary(['a', 'a', 'b', 'b'])),
    v: [1, 2, 3, 4]
  });

  const gt = dt.groupby('d');
  t.equal(
    gt.groups().keys,
    dt.column('d').groups().keys,
    'groupby reuses internal dictionary keys'
  );

  t.end();
});
import tape from 'tape';
import tableEqual from '../table-equal';
import { all, desc, not, range, table } from '../../src/verbs';

tape('select selects a subset of columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abcd'.split('')
  };

  const st = table(data).select('a', 'c');

  t.equal(st.numRows(), 4, 'num rows');
  t.equal(st.numCols(), 2, 'num cols');
  tableEqual(t, st, { a: data.a, c: data.c }, 'selected data');
  t.end();
});

tape('select renames columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abcd'.split('')
  };

  const st = table(data).select({ b: 'foo', c: 'bar', a: 'baz' });

  t.deepEqual(st.columnNames(), ['foo', 'bar', 'baz'], 'renamed columns');
  tableEqual(t, st, {
    foo: data.b, bar: data.c, baz: data.a
  }, 'selected data');
  t.end();
});

tape('select uses last instance of repeated columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abcd'.split('')
  };

  const st = table(data).select(all(), { a: 'x', c: 'y' }, { c: 'z' });

  t.deepEqual(st.columnNames(), ['x', 'b', 'z'], 'renamed columns');
  tableEqual(t, st, {
    x: data.a, b: data.b, z: data.c
  }, 'selected data');
  t.end();
});

tape('select reorders columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abcd'.split('')
  };

  const dt = table(data);
  const st = dt.select(dt.columnNames().reverse());

  t.deepEqual(st.columnNames(), ['c', 'b', 'a'], 'reordered names');
  t.deepEqual(
    [st.columnIndex('a'), st.columnIndex('b'), st.columnIndex('c')],
    [2, 1, 0],
    'reordered indices'
  );
  tableEqual(t, st, data, 'selected data');
  t.end();
});

tape('select accepts selection helpers', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abcd'.split('')
  };

  t.deepEqual(
    table(data).select(not('a', 'c')).columnNames(),
    ['b'],
    'select not name'
  );

  t.deepEqual(
    table(data).select(not(1)).columnNames(),
    ['a', 'c'],
    'select not index'
  );

  t.deepEqual(
    table(data).select(range('b', 'c')).columnNames(),
    ['b', 'c'],
    'select range name'
  );

  t.deepEqual(
    table(data).select(range('c', 'b')).columnNames(),
    ['b', 'c'],
    'select reversed range name'
  );

  t.deepEqual(
    table(data).select(range(0, 1)).columnNames(),
    ['a', 'b'],
    'select range index'
  );

  t.deepEqual(
    table(data).select(range(1, 0)).columnNames(),
    ['a', 'b'],
    'select reversed range index'
  );

  t.deepEqual(
    table(data).select(not(range(0, 1))).columnNames(),
    ['c'],
    'select not range'
  );

  t.end();
});

tape('select does not conflict with groupby', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abbb'.split('')
  };

  const st = table(data).groupby('c').select('a', 'b', {'c': 'd'});

  t.deepEqual(
    st.columnNames(),
    ['a', 'b', 'd'],
    'renamed columns'
  );

  tableEqual(t, st.count({ as: 'n' }), {
    c: ['a', 'b'], n: [1, 3]
  }, 'groupby not conflicted');

  t.end();
});

tape('select does not conflict with orderby', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 6, 8, 4],
    c: 'abcd'.split('')
  };

  const st = table(data).orderby(desc('b')).select('c').reify();

  tableEqual(t, st, {
    c: ['c', 'b', 'd', 'a']
  }, 'orderby not conflicted');

  t.end();
});
import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import {
  all, desc, endswith, matches, not, range, startswith, table
} from '../../src/index.js';

describe('select', () => {
  it('selects a subset of columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abcd'.split('')
    };

    const st = table(data).select('a', 'c');

    assert.equal(st.numRows(), 4, 'num rows');
    assert.equal(st.numCols(), 2, 'num cols');
    tableEqual(st, { a: data.a, c: data.c }, 'selected data');
  });

  it('handles columns with numeric names', () => {
    const data = {
      country: [0],
      '1999': [1],
      '2000': [2]
    };

    const dt = table(data, ['country', '1999', '2000']);
    assert.deepEqual(
      dt.columnNames(),
      ['country', '1999', '2000']
    );

    assert.deepEqual(
      dt.select('1999', 'country', '2000').columnNames(),
      ['1999', 'country', '2000']
    );
  });

  it('renames columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abcd'.split('')
    };

    const st = table(data).select({ b: 'foo', c: 'bar', a: 'baz' });

    assert.deepEqual(st.columnNames(), ['foo', 'bar', 'baz'], 'renamed columns');
    tableEqual(st, {
      foo: data.b, bar: data.c, baz: data.a
    }, 'selected data');
  });

  it('uses last instance of repeated columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abcd'.split('')
    };

    const st = table(data).select(all(), { a: 'x', c: 'y' }, { c: 'z' });

    assert.deepEqual(st.columnNames(), ['x', 'b', 'z'], 'renamed columns');
    tableEqual(st, {
      x: data.a, b: data.b, z: data.c
    }, 'selected data');
  });

  it('reorders columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abcd'.split('')
    };

    const dt = table(data);
    const st = dt.select(dt.columnNames().reverse());

    assert.deepEqual(st.columnNames(), ['c', 'b', 'a'], 'reordered names');
    assert.deepEqual(
      [st.columnIndex('a'), st.columnIndex('b'), st.columnIndex('c')],
      [2, 1, 0],
      'reordered indices'
    );
    tableEqual(st, data, 'selected data');
  });

  it('accepts selection helpers', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abcd'.split('')
    };

    assert.deepEqual(
      table(data).select(not('a', 'c')).columnNames(),
      ['b'],
      'select not name'
    );

    assert.deepEqual(
      table(data).select(not(1)).columnNames(),
      ['a', 'c'],
      'select not index'
    );

    assert.deepEqual(
      table(data).select(range('b', 'c')).columnNames(),
      ['b', 'c'],
      'select range name'
    );

    assert.deepEqual(
      table(data).select(range('c', 'b')).columnNames(),
      ['b', 'c'],
      'select reversed range name'
    );

    assert.deepEqual(
      table(data).select(range(0, 1)).columnNames(),
      ['a', 'b'],
      'select range index'
    );

    assert.deepEqual(
      table(data).select(range(1, 0)).columnNames(),
      ['a', 'b'],
      'select reversed range index'
    );

    assert.deepEqual(
      table(data).select(not(range(0, 1))).columnNames(),
      ['c'],
      'select not range'
    );

    assert.deepEqual(
      table(data).select(matches('b')).columnNames(),
      ['b'],
      'select match string'
    );

    assert.deepEqual(
      table(data).select(matches(/A|c/i)).columnNames(),
      ['a', 'c'],
      'select match regexp'
    );

    const data2 = {
      'foo.bar': [],
      'foo.baz': [],
      'bop.bar': [],
      'bop.baz': []
    };

    assert.deepEqual(
      table(data2).select(startswith('foo.')).columnNames(),
      ['foo.bar', 'foo.baz'],
      'select startswith'
    );

    assert.deepEqual(
      table(data2).select(endswith('.baz')).columnNames(),
      ['foo.baz', 'bop.baz'],
      'select startswith'
    );
  });

  it('does not conflict with groupby', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abbb'.split('')
    };

    const st = table(data).groupby('c').select('a', 'b', {'c': 'd'});

    assert.deepEqual(
      st.columnNames(),
      ['a', 'b', 'd'],
      'renamed columns'
    );

    tableEqual(st.count({ as: 'n' }), {
      c: ['a', 'b'], n: [1, 3]
    }, 'groupby not conflicted');
  });

  it('does not conflict with orderby', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 6, 8, 4],
      c: 'abcd'.split('')
    };

    const st = table(data).orderby(desc('b')).select('c').reify();

    tableEqual(st, {
      c: ['c', 'b', 'd', 'a']
    }, 'orderby not conflicted');
  });
});

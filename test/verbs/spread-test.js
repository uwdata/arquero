import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { op, table } from '../../src/index.js';

describe('spread', () => {
  it('produces multiple columns from arrays', () => {
    const data = {
      text: ['foo bar bop', 'foo', 'bar baz', 'baz bop']
    };

    const dt = table(data).spread(
      { split: d => op.split(d.text, ' ') },
      { limit: 2 }
    );

    tableEqual(dt, {
      ...data,
      split_1: [ 'foo', 'foo', 'bar', 'baz' ],
      split_2: [ 'bar', undefined, 'baz', 'bop' ]
    }, 'spread data');
  });

  it('supports column name argument', () => {
    const data = {
      list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
    };

    const dt = table(data).spread('list', { drop: false, limit: 2 });

    tableEqual(dt, {
      ...data,
      list_1: [ 'foo', 'foo', 'bar', 'baz' ],
      list_2: [ 'bar', undefined, 'baz', 'bop' ]
    }, 'spread data');
  });

  it('supports column index argument', () => {
    const data = {
      list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
    };

    const dt = table(data).spread(0, { limit: 2 });

    tableEqual(dt, {
      list_1: [ 'foo', 'foo', 'bar', 'baz' ],
      list_2: [ 'bar', undefined, 'baz', 'bop' ]
    }, 'spread data');
  });

  it('supports multiple input columns', () => {
    const data = {
      a: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']],
      b: [['baz', 'bop'], ['bar', 'baz'], ['foo'], ['foo', 'bar', 'bop']]
    };

    const dt = table(data).spread(['a', 'b'], { limit: 2 });

    tableEqual(dt, {
      a_1: [ 'foo', 'foo', 'bar', 'baz' ],
      a_2: [ 'bar', undefined, 'baz', 'bop' ],
      b_1: [ 'baz', 'bar', 'foo', 'foo' ],
      b_2: [ 'bop', 'baz', undefined, 'bar' ]
    }, 'spread data');
  });

  it('supports as option with single column input', () => {
    const data = {
      list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
    };

    const dt = table(data).spread('list', { as: ['bip', 'bop'] });

    tableEqual(dt, {
      bip: [ 'foo', 'foo', 'bar', 'baz' ],
      bop: [ 'bar', undefined, 'baz', 'bop' ]
    }, 'spread data with as');
  });

  it('ignores as option with multi column input', () => {
    const data = {
      key: ['a', 'b', 'c', 'd'],
      a: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']],
      b: [['baz', 'bop'], ['bar', 'baz'], ['foo'], ['foo', 'bar', 'bop']]
    };

    const dt = table(data).spread(['a', 'b'], { limit: 2, as: ['bip', 'bop'] });

    tableEqual(dt, {
      key: ['a', 'b', 'c', 'd'],
      a_1: [ 'foo', 'foo', 'bar', 'baz' ],
      a_2: [ 'bar', undefined, 'baz', 'bop' ],
      b_1: [ 'baz', 'bar', 'foo', 'foo' ],
      b_2: [ 'bop', 'baz', undefined, 'bar' ]
    }, 'spread data with as');
  });

  it('handles arrays of varying length', () => {
    const data1 = {
      u: [
        ['A', 'B', 'C'],
        ['D', 'E']
      ]
    };
    const data2 = {
      u: data1.u.slice().reverse()
    };
    const obj = [
      { u_1: 'A', u_2: 'B', u_3: 'C' },
      { u_1: 'D', u_2: 'E', u_3: undefined }
    ];

    assert.deepEqual(
      table(data1).spread('u').objects(),
      obj,
      'spread data, larger first'
    );

    assert.deepEqual(
      table(data2).spread('u').objects(),
      obj.slice().reverse(),
      'spread data, smaller first'
    );
  });
});

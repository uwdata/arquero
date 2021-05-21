import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src';

tape('spread produces multiple columns from arrays', t => {
  const data = {
    text: ['foo bar bop', 'foo', 'bar baz', 'baz bop']
  };

  const dt = table(data).spread(
    { split: d => op.split(d.text, ' ') },
    { limit: 2 }
  );

  tableEqual(t, dt, {
    ...data,
    split_1: [ 'foo', 'foo', 'bar', 'baz' ],
    split_2: [ 'bar', undefined, 'baz', 'bop' ]
  }, 'spread data');
  t.end();
});

tape('spread supports column name argument', t => {
  const data = {
    list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
  };

  const dt = table(data).spread('list', { drop: false, limit: 2 });

  tableEqual(t, dt, {
    ...data,
    list_1: [ 'foo', 'foo', 'bar', 'baz' ],
    list_2: [ 'bar', undefined, 'baz', 'bop' ]
  }, 'spread data');
  t.end();
});

tape('spread supports column index argument', t => {
  const data = {
    list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
  };

  const dt = table(data).spread(0, { limit: 2 });

  tableEqual(t, dt, {
    list_1: [ 'foo', 'foo', 'bar', 'baz' ],
    list_2: [ 'bar', undefined, 'baz', 'bop' ]
  }, 'spread data');
  t.end();
});

tape('spread supports multiple input columns', t => {
  const data = {
    a: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']],
    b: [['baz', 'bop'], ['bar', 'baz'], ['foo'], ['foo', 'bar', 'bop']]
  };

  const dt = table(data).spread(['a', 'b'], { limit: 2 });

  tableEqual(t, dt, {
    a_1: [ 'foo', 'foo', 'bar', 'baz' ],
    a_2: [ 'bar', undefined, 'baz', 'bop' ],
    b_1: [ 'baz', 'bar', 'foo', 'foo' ],
    b_2: [ 'bop', 'baz', undefined, 'bar' ]
  }, 'spread data');
  t.end();
});

tape('spread supports as option with single column input', t => {
  const data = {
    list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
  };

  const dt = table(data).spread('list', { as: ['bip', 'bop'] });

  tableEqual(t, dt, {
    bip: [ 'foo', 'foo', 'bar', 'baz' ],
    bop: [ 'bar', undefined, 'baz', 'bop' ]
  }, 'spread data with as');
  t.end();
});

tape('spread ignores as option with multi column input', t => {
  const data = {
    key: ['a', 'b', 'c', 'd'],
    a: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']],
    b: [['baz', 'bop'], ['bar', 'baz'], ['foo'], ['foo', 'bar', 'bop']]
  };

  const dt = table(data).spread(['a', 'b'], { limit: 2, as: ['bip', 'bop'] });

  tableEqual(t, dt, {
    key: ['a', 'b', 'c', 'd'],
    a_1: [ 'foo', 'foo', 'bar', 'baz' ],
    a_2: [ 'bar', undefined, 'baz', 'bop' ],
    b_1: [ 'baz', 'bar', 'foo', 'foo' ],
    b_2: [ 'bop', 'baz', undefined, 'bar' ]
  }, 'spread data with as');
  t.end();
});
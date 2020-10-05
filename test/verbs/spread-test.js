import tape from 'tape';
import tableEqual from '../table-equal';
import { op, table } from '../../src/verbs';

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
    split1: [ 'foo', 'foo', 'bar', 'baz' ],
    split2: [ 'bar', null, 'baz', 'bop' ]
  }, 'spread data');
  t.end();
});

tape('spread supports column name argument', t => {
  const data = {
    list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
  };

  const dt = table(data).spread('list', { limit: 2 });

  tableEqual(t, dt, {
    ...data,
    list1: [ 'foo', 'foo', 'bar', 'baz' ],
    list2: [ 'bar', null, 'baz', 'bop' ]
  }, 'spread data');
  t.end();
});

tape('spread supports column index argument', t => {
  const data = {
    list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
  };

  const dt = table(data).spread(0, { limit: 2 });

  tableEqual(t, dt, {
    ...data,
    list1: [ 'foo', 'foo', 'bar', 'baz' ],
    list2: [ 'bar', null, 'baz', 'bop' ]
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
    ...data,
    a1: [ 'foo', 'foo', 'bar', 'baz' ],
    a2: [ 'bar', null, 'baz', 'bop' ],
    b1: [ 'baz', 'bar', 'foo', 'foo' ],
    b2: [ 'bop', 'baz', null, 'bar' ]
  }, 'spread data');
  t.end();
});

tape('spread supports as option with single column input', t => {
  const data = {
    list: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']]
  };

  const dt = table(data).spread('list', { limit: 2, as: ['bip', 'bop'] });

  tableEqual(t, dt, {
    ...data,
    bip: [ 'foo', 'foo', 'bar', 'baz' ],
    bop: [ 'bar', null, 'baz', 'bop' ]
  }, 'spread data with as');
  t.end();
});

tape('spread ignores as option with multi column input', t => {
  const data = {
    a: [['foo', 'bar', 'bop'], ['foo'], ['bar', 'baz'], ['baz', 'bop']],
    b: [['baz', 'bop'], ['bar', 'baz'], ['foo'], ['foo', 'bar', 'bop']]
  };

  const dt = table(data).spread(['a', 'b'], { limit: 2, as: ['bip', 'bop'] });

  tableEqual(t, dt, {
    ...data,
    a1: [ 'foo', 'foo', 'bar', 'baz' ],
    a2: [ 'bar', null, 'baz', 'bop' ],
    b1: [ 'baz', 'bar', 'foo', 'foo' ],
    b2: [ 'bop', 'baz', null, 'bar' ]
  }, 'spread data with as');
  t.end();
});
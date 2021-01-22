import tape from 'tape';
import { not, range, table } from '../../src';

tape('relocate repositions columns', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  t.deepEqual(
    dt.relocate('a', { before: 'd' }).columnNames(),
    ['b', 'c', 'a', 'd'],
    'relocate data, before'
  );

  t.deepEqual(
    dt.relocate(not('b', 'd'), { before: 'b' }).columnNames(),
    ['a', 'c', 'b', 'd'],
    'relocate data, before'
  );

  t.deepEqual(
    dt.relocate(not('b', 'd'), { after: 'd' }).columnNames(),
    ['b', 'd', 'a', 'c'],
    'relocate data, after'
  );

  t.deepEqual(
    dt.relocate(not('b', 'd'), { before: 'c' }).columnNames(),
    ['b', 'a', 'c', 'd'],
    'relocate data, before self'
  );

  t.deepEqual(
    dt.relocate(not('b', 'd'), { after: 'a' }).columnNames(),
    ['a', 'c', 'b', 'd'],
    'relocate data, after self'
  );

  t.end();
});

tape('relocate repositions columns using multi-column anchor', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  t.deepEqual(
    dt.relocate([1, 3], { before: range(2, 3) }).columnNames(),
    ['a', 'b', 'd', 'c'],
    'relocate data, before range'
  );

  t.deepEqual(
    dt.relocate([1, 3], { after: range(2, 3) }).columnNames(),
    ['a', 'c', 'b', 'd'],
    'relocate data, after range'
  );

  t.end();
});

tape('relocate repositions and renames columns', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  t.deepEqual(
    dt.relocate({ a: 'e', c: 'f' }, { before: { b: '?' } }).columnNames(),
    ['e', 'f', 'b', 'd'],
    'relocate data, before plus rename'
  );

  t.deepEqual(
    dt.relocate({ a: 'e', c: 'f' }, { after: { b: '?' } }).columnNames(),
    ['b', 'e', 'f', 'd'],
    'relocate data, after plus rename'
  );

  t.end();
});

tape('relocate throws errors for invalid options', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  t.throws(() => dt.relocate(not('b', 'd')), 'missing options');
  t.throws(() => dt.relocate(not('b', 'd'), {}), 'empty options');
  t.throws(
    () => dt.relocate(not('b', 'd'), { before: 'b', after: 'b' }),
    'over-specified options'
  );

  t.end();
});

import tape from 'tape';
import tableEqual from '../table-equal';
import { not, range, table } from '../../src/verbs';

tape('relocate repositions columns', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  tableEqual(t,
    dt.relocate(not('b', 'd'), { before: 'b' }),
    { a, c, b, d },
    'relocate data, before'
  );

  tableEqual(t,
    dt.relocate(not('b', 'd'), { after: 'd' }),
    { b, d, a, c },
    'relocate data, after'
  );

  tableEqual(t,
    dt.relocate(not('b', 'd'), { before: 'c' }),
    { b, a, c, d },
    'relocate data, before self'
  );

  tableEqual(t,
    dt.relocate(not('b', 'd'), { after: 'a' }),
    { a, c, b, d },
    'relocate data, after self'
  );

  t.end();
});

tape('relocate repositions columns using multi-column anchor', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  tableEqual(t,
    dt.relocate([1, 3], { before: range(2, 3) }),
    { b, a, c, d },
    'relocate data, before range'
  );

  tableEqual(t,
    dt.relocate([1, 3], { after: range(2, 3) }),
    { b, d, a, c },
    'relocate data, after range'
  );

  t.end();
});

tape('relocate repositions and renames columns', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  tableEqual(t,
    dt.relocate({ a: 'e', c: 'f' }, { before: { b: '?' } }),
    { e: a, f: c, b, d },
    'relocate data, before plus rename'
  );

  tableEqual(t,
    dt.relocate({ a: 'e', c: 'f' }, { after: { b: '?' } }),
    { b, d, e: a, f: c },
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

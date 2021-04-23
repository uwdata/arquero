import tape from 'tape';
import tableEqual from '../table-equal';
import { table } from '../../src';

tape('rename renames columns', t => {
  const data = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8],
    c: 'abcd'.split('')
  };

  tableEqual(t,
    table(data).rename({ a: 'z'}),
    { z: data.a, b: data.b, c: data.c },
    'renamed data, single column'
  );

  tableEqual(t,
    table(data).rename({ a: 'z', b: 'y' }),
    { z: data.a, y: data.b, c: data.c },
    'renamed data, multiple columns'
  );

  t.deepEqual(
    table(data).rename({ a: 'z', c: 'x' }).columnNames(),
    ['z', 'b', 'x'],
    'renamed data, preserves order'
  );

  tableEqual(t,
    table(data).rename('a', 'b'),
    data,
    'renamed data, no rename'
  );

  tableEqual(t,
    table(data).rename(),
    data,
    'renamed data, no arguments'
  );

  tableEqual(t,
    table(data).rename({ a: 'z'}, { c: 'x' }),
    { z: data.a, b: data.b, x: data.c },
    'renamed data, multiple arguments'
  );

  t.end();
});
import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { table } from '../../src/index.js';

describe('rename', () => {
  it(' renames columns', () => {
    const data = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8],
      c: 'abcd'.split('')
    };

    tableEqual(
      table(data).rename({ a: 'z'}),
      { z: data.a, b: data.b, c: data.c },
      'renamed data, single column'
    );

    tableEqual(
      table(data).rename({ a: 'z', b: 'y' }),
      { z: data.a, y: data.b, c: data.c },
      'renamed data, multiple columns'
    );

    assert.deepEqual(
      table(data).rename({ a: 'z', c: 'x' }).columnNames(),
      ['z', 'b', 'x'],
      'renamed data, preserves order'
    );

    tableEqual(
      table(data).rename('a', 'b'),
      data,
      'renamed data, no rename'
    );

    tableEqual(
      table(data).rename(),
      data,
      'renamed data, no arguments'
    );

    tableEqual(
      table(data).rename({ a: 'z'}, { c: 'x' }),
      { z: data.a, b: data.b, x: data.c },
      'renamed data, multiple arguments'
    );
  });
});

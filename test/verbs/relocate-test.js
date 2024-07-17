import assert from 'node:assert';
import { not, range, table } from '../../src/index.js';

describe('relocate', () => {
  it(' repositions columns', () => {
    const a = [1], b = [2], c = [3], d = [4];
    const dt = table({ a, b, c, d });

    assert.deepEqual(
      dt.relocate('a', { before: 'd' }).columnNames(),
      ['b', 'c', 'a', 'd'],
      'relocate data, before'
    );

    assert.deepEqual(
      dt.relocate(not('b', 'd'), { before: 'b' }).columnNames(),
      ['a', 'c', 'b', 'd'],
      'relocate data, before'
    );

    assert.deepEqual(
      dt.relocate(not('b', 'd'), { after: 'd' }).columnNames(),
      ['b', 'd', 'a', 'c'],
      'relocate data, after'
    );

    assert.deepEqual(
      dt.relocate(not('b', 'd'), { before: 'c' }).columnNames(),
      ['b', 'a', 'c', 'd'],
      'relocate data, before self'
    );

    assert.deepEqual(
      dt.relocate(not('b', 'd'), { after: 'a' }).columnNames(),
      ['a', 'c', 'b', 'd'],
      'relocate data, after self'
    );
  });

  it(' repositions columns using multi-column anchor', () => {
    const a = [1], b = [2], c = [3], d = [4];
    const dt = table({ a, b, c, d });

    assert.deepEqual(
      dt.relocate([1, 3], { before: range(2, 3) }).columnNames(),
      ['a', 'b', 'd', 'c'],
      'relocate data, before range'
    );

    assert.deepEqual(
      dt.relocate([1, 3], { after: range(2, 3) }).columnNames(),
      ['a', 'c', 'b', 'd'],
      'relocate data, after range'
    );
  });

  it(' repositions and renames columns', () => {
    const a = [1], b = [2], c = [3], d = [4];
    const dt = table({ a, b, c, d });

    assert.deepEqual(
      dt.relocate({ a: 'e', c: 'f' }, { before: { b: '?' } }).columnNames(),
      ['e', 'f', 'b', 'd'],
      'relocate data, before plus rename'
    );

    assert.deepEqual(
      dt.relocate({ a: 'e', c: 'f' }, { after: { b: '?' } }).columnNames(),
      ['b', 'e', 'f', 'd'],
      'relocate data, after plus rename'
    );
  });

  it(' throws errors for invalid options', () => {
    const a = [1], b = [2], c = [3], d = [4];
    const dt = table({ a, b, c, d });

    assert.throws(() => dt.relocate(not('b', 'd')), 'missing options');
    assert.throws(() => dt.relocate(not('b', 'd'), {}), 'empty options');
    assert.throws(
      () => dt.relocate(not('b', 'd'), { before: 'b', after: 'b' }),
      'over-specified options'
    );
  });
});

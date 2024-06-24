import assert from 'node:assert';
import { op } from '../../src/index.js';

describe('json op', () => {
  it('parse_json parses json strings', () => {
    assert.deepEqual([
      op.parse_json('1'),
      op.parse_json('[3,2,1.2]'),
      op.parse_json('{"foo":true,"bar":"bop","baz":null}')
    ], [
      1,
      [3, 2, 1.2],
      {foo: true, bar: 'bop', baz: null}
    ], 'parse_json');
  });

  it('to_json generates json strings', () => {
    assert.deepEqual([
      op.to_json(1),
      op.to_json([3, 2, 1.2]),
      op.to_json({foo: true, bar: 'bop', baz: null, buz: undefined})
    ], [
      '1',
      '[3,2,1.2]',
      '{"foo":true,"bar":"bop","baz":null}'

    ], 'to_json');
  });
});

import tape from 'tape';
import { op } from '../../src';

tape('op.parse_json parses json strings', t => {
  t.deepEqual([
    op.parse_json('1'),
    op.parse_json('[3,2,1.2]'),
    op.parse_json('{"foo":true,"bar":"bop","baz":null}')
  ], [
    1,
    [3, 2, 1.2],
    {foo: true, bar: 'bop', baz: null}
  ], 'parse_json');
  t.end();
});

tape('op.to_json generates json strings', t => {
  t.deepEqual([
    op.to_json(1),
    op.to_json([3, 2, 1.2]),
    op.to_json({foo: true, bar: 'bop', baz: null, buz: undefined})
  ], [
    '1',
    '[3,2,1.2]',
    '{"foo":true,"bar":"bop","baz":null}'

  ], 'to_json');
  t.end();
});
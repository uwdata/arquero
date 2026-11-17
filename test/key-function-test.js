import assert from 'node:assert';
import { key, keyFunction } from '../src/util/key-function.js';

describe('key encoding', () => {
  it('distinguishes composite strings containing quotes and separators', () => {
    const get = keyFunction([row => row[0], row => row[1]]);
    assert.notEqual(
      get(['east"|"enterprise', 'renewal']),
      get(['east', 'enterprise"|"renewal'])
    );
  });

  it('distinguishes strings nested in arrays and objects', () => {
    assert.notEqual(key(['a","b']), key(['a', 'b']));
    assert.notEqual(key({ a: 'b","c":"d' }), key({ a: 'b', c: 'd' }));
    assert.notEqual(key([['a","b']]), key([['a', 'b']]));
  });

  it('distinguishes quoted object property names', () => {
    assert.notEqual(key({ 'a":1,"b': 2 }), key({ a: 1, b: 2 }));
    assert.notEqual(key({ 'a\\': 1 }), key({ a: 1 }));
  });

  it('preserves non-string key semantics', () => {
    for (const value of [undefined, null, false, true, 0, 1, Infinity, NaN]) {
      assert.ok(Object.is(key(value), value));
    }
    assert.equal(key(new Date(123)), 123);
    assert.equal(key(/a|b/gi), '/a|b/gi');
    assert.equal(key(new Uint8Array([1, 2])), '[1,2]');
    assert.equal(key([1, null, NaN]), '[1,,NaN]');
    assert.equal(key({ a: 1, b: null }), '{"a":1,"b":null}');
  });

  it('preserves backslashes, control characters and Unicode distinctions', () => {
    const values = ['', '"', '\\', '\n', '\\n', '\u0000', '東京', '\ud800', '\ufffd'];
    assert.equal(new Set(values.map(key)).size, values.length);
  });
});

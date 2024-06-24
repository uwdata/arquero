import assert from 'node:assert';
import { op } from '../../src/index.js';

describe('string op', () => {
  it('parse_date parses date values', () => {
    assert.deepEqual(
      [
        op.parse_date('2001-01-01'),
        op.parse_date(null),
        op.parse_date(undefined)
      ],
      [ new Date(Date.UTC(2001, 0, 1)), null, undefined ],
      'parse_date'
    );
  });

  it('parse_float parses float values', () => {
    assert.deepEqual(
      [
        op.parse_float('1.2'),
        op.parse_float(null),
        op.parse_float(undefined)
      ],
      [ 1.2, null, undefined ],
      'parse_float'
    );
  });

  it('parse_int parses integer values', () => {
    assert.deepEqual(
      [
        op.parse_int('1'),
        op.parse_int('F', 16),
        op.parse_int(null),
        op.parse_int(undefined)
      ],
      [ 1, 15, null, undefined ],
      'parse_int'
    );
  });

  it('endswith tests if a string ends with a substring', () => {
    assert.deepEqual(
      [
        op.endswith('123', '3'),
        op.endswith('123', '1'),
        op.endswith('123', '3', 2),
        op.endswith(null, '1'),
        op.endswith(undefined, '1')
      ],
      [ true, false, false, false, false ],
      'endswith'
    );
  });

  it('match returns pattern matches', () => {
    assert.deepEqual(
      [
        op.match('foo', /bar/),
        op.match('1 2 3 4', /\d+/).slice(),
        op.match('1 2 3 4', /\d+/g),
        op.match('1 2 3 4', /\d+ (\d+)/, 1),
        op.match('1 2 3 4', /(?<digit>\d+)/, 'digit'),
        op.match('1 2 3 4', /\d+/, 'digit'),
        op.match(null, /\d+/),
        op.match(undefined, /\d+/)
      ],
      [
        null, ['1'], ['1', '2', '3', '4'], '2', '1', null,
        null, undefined
      ],
      'match'
    );
  });

  it('normalize normalizes strings', () => {
    assert.deepEqual(
      [
        op.normalize('abc'),
        op.normalize('\u006E\u0303'),
        op.normalize(null),
        op.normalize(undefined)
      ],
      [ 'abc', '\u00F1', null, undefined ],
      'normalize'
    );
  });

  it('padend pads the end of strings', () => {
    assert.deepEqual(
      [
        op.padend('abc', 4),
        op.padend('abc', 4, ' '),
        op.padend('abc', 5, '#'),
        op.padend(null),
        op.padend(undefined)
      ],
      [ 'abc ', 'abc ', 'abc##', null, undefined ],
      'padend'
    );
  });

  it('padstart pads the start of strings', () => {
    assert.deepEqual(
      [
        op.padstart('abc', 4),
        op.padstart('abc', 4, ' '),
        op.padstart('abc', 5, '#'),
        op.padstart(null),
        op.padstart(undefined)
      ],
      [ ' abc', ' abc', '##abc', null, undefined ],
      'padstart'
    );
  });

  it('upper maps a string to upper-case', () => {
    assert.deepEqual(
      [
        op.upper('abc'),
        op.upper(null),
        op.upper(undefined)
      ],
      [ 'ABC', null, undefined ],
      'upper'
    );
  });

  it('lower maps a string to lower-case', () => {
    assert.deepEqual(
      [
        op.lower('ABC'),
        op.lower(null),
        op.lower(undefined)
      ],
      [ 'abc', null, undefined ],
      'lower'
    );
  });

  it('repeat repeats a string', () => {
    assert.deepEqual(
      [
        op.repeat('a', 3),
        op.repeat(null, 2),
        op.repeat(undefined, 2)
      ],
      [ 'aaa', null, undefined ],
      'repeat'
    );
  });

  it('replace replaces a pattern within a string', () => {
    assert.deepEqual(
      [
        op.replace('aba', 'a', 'c'),
        op.replace('aba', /a/, 'c'),
        op.replace('aba', /a/g, 'c'),
        op.replace(null, 'a', 'c'),
        op.replace(undefined, 'a', 'c')
      ],
      [ 'cba', 'cba', 'cbc', null, undefined ],
      'replace'
    );
  });

  it('substring extracts a substring', () => {
    assert.deepEqual(
      [
        op.substring('aba', 0, 1),
        op.substring('aba', 0, 2),
        op.substring('aba', 1, 3),
        op.substring(null, 0, 1),
        op.substring(undefined, 0, 1)
      ],
      [ 'a', 'ab', 'ba', null, undefined ],
      'substring'
    );
  });

  it('split splits a string on a delimter pattern', () => {
    assert.deepEqual(
      [
        op.split('aba', ''),
        op.split('a,b,a', ','),
        op.split('a,b,a', /,/),
        op.split(null, ','),
        op.split(undefined, ',')
      ],
      [ ['a', 'b', 'a'], ['a', 'b', 'a'], ['a', 'b', 'a'], [], [] ],
      'split'
    );
  });

  it('startswith tests if a starts ends with a substring', () => {
    assert.deepEqual(
      [
        op.startswith('123', '3'),
        op.startswith('123', '1'),
        op.startswith('123', '1', 2),
        op.startswith(null, '1'),
        op.startswith(undefined, '1')
      ],
      [ false, true, false, false, false ],
      'startswith'
    );
  });

  it('trim trims whitespace from a string', () => {
    assert.deepEqual(
      [
        op.trim('1'),
        op.trim('  1  '),
        op.trim(null),
        op.trim(undefined)
      ],
      [ '1', '1', null, undefined ],
      'trim'
    );
  });
});

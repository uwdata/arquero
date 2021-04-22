import tape from 'tape';
import { op } from '../../src';

tape('op.parse_date parses date values', t => {
  t.deepEqual(
    [
      op.parse_date('2001-01-01'),
      op.parse_date(null),
      op.parse_date(undefined)
    ],
    [ new Date(Date.UTC(2001, 0, 1)), null, undefined ],
    'parse_date'
  );
  t.end();
});

tape('op.parse_float parses float values', t => {
  t.deepEqual(
    [
      op.parse_float('1.2'),
      op.parse_float(null),
      op.parse_float(undefined)
    ],
    [ 1.2, null, undefined ],
    'parse_float'
  );
  t.end();
});

tape('op.parse_int parses integer values', t => {
  t.deepEqual(
    [
      op.parse_int('1'),
      op.parse_int('F', 16),
      op.parse_int(null),
      op.parse_int(undefined)
    ],
    [ 1, 15, null, undefined ],
    'parse_int'
  );
  t.end();
});

tape('op.endswith tests if a string ends with a substring', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.match returns pattern matches', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.normalize normalizes strings', t => {
  t.deepEqual(
    [
      op.normalize('abc'),
      op.normalize('\u006E\u0303'),
      op.normalize(null),
      op.normalize(undefined)
    ],
    [ 'abc', '\u00F1', null, undefined ],
    'normalize'
  );
  t.end();
});

tape('op.padend pads the end of strings', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.padstart pads the start of strings', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.upper maps a string to upper-case', t => {
  t.deepEqual(
    [
      op.upper('abc'),
      op.upper(null),
      op.upper(undefined)
    ],
    [ 'ABC', null, undefined ],
    'upper'
  );
  t.end();
});

tape('op.lower maps a string to lower-case', t => {
  t.deepEqual(
    [
      op.lower('ABC'),
      op.lower(null),
      op.lower(undefined)
    ],
    [ 'abc', null, undefined ],
    'lower'
  );
  t.end();
});

tape('op.repeat repeats a string', t => {
  t.deepEqual(
    [
      op.repeat('a', 3),
      op.repeat(null, 2),
      op.repeat(undefined, 2)
    ],
    [ 'aaa', null, undefined ],
    'repeat'
  );
  t.end();
});

tape('op.replace replaces a pattern within a string', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.substring extracts a substring', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.split splits a string on a delimter pattern', t => {
  t.deepEqual(
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
  t.end();
});


tape('op.startswith tests if a starts ends with a substring', t => {
  t.deepEqual(
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
  t.end();
});

tape('op.trim trims whitespace from a string', t => {
  t.deepEqual(
    [
      op.trim('1'),
      op.trim('  1  '),
      op.trim(null),
      op.trim(undefined)
    ],
    [ '1', '1', null, undefined ],
    'trim'
  );
  t.end();
});

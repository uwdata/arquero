import assert from 'node:assert';
import { inferFormat } from '../../src/format/util/infer.js';
import { formatValue } from '../../src/format/util/format-value.js';

function formatsAs(values, strings, options) {
  const { format } = inferFormat(f => values.forEach(f), options);
  const out = values.map(v => formatValue(v, format));
  assert.deepEqual(out, strings, `formats [${strings.join(', ')}]`);
}

const loc = (y, m, d, H, M, S, u) =>
  new Date(y, m - 1, d, H || 0, M || 0, S || 0, u || 0);

const utc = (y, m, d, H, M, S, u) =>
  new Date(Date.UTC(y, m - 1, d, H || 0, M || 0, S || 0, u || 0));

describe('formatValue', () => {
  it('formats invalid values', () => {
    formatsAs([NaN], ['NaN']);
    formatsAs([null], ['null']);
    formatsAs([undefined], ['undefined']);
  });

  it('formats boolean values', () => {
    formatsAs([true], ['true']);
    formatsAs([false], ['false']);
    formatsAs([true, false, null], ['true', 'false', 'null']);
  });

  it('formats number values', () => {
    // integers
    formatsAs([0], ['0']);
    formatsAs([-0], ['0']);
    formatsAs([1], ['1']);
    formatsAs([-1], ['-1']);

    // decimals
    formatsAs([Math.E], ['2.718282']);
    formatsAs([3.14], ['3.14']);
    formatsAs([1/3], ['0.3333'], { maxdigits: 4 });
    formatsAs([1/3], ['0.333333'], { maxdigits: 6 });
    formatsAs([1/3], ['0.33333333'], { maxdigits: 8 });
    formatsAs([-1/3], ['-0.3333'], { maxdigits: 4 });
    formatsAs([-1/3], ['-0.333333'], { maxdigits: 6 });
    formatsAs([-1/3], ['-0.33333333'], { maxdigits: 8 });

    // fixed -> exponential
    formatsAs([0.1], ['0.1'], { maxdigits: 4 });
    formatsAs([0.01], ['0.01'], { maxdigits: 4 });
    formatsAs([0.001], ['0.001'], { maxdigits: 4 });
    formatsAs([0.0001], ['0.0001'], { maxdigits: 4 });
    formatsAs([0.00001], ['1.0000e-5'], { maxdigits: 4 });
    formatsAs([0.000001], ['1.0000e-6'], { maxdigits: 4 });
    formatsAs([1e30], ['1e+30']);
    formatsAs([-1e30], ['-1e+30']);
    formatsAs([1.23e-18], ['1.23e-18']);
    formatsAs([-1.23e-18], ['-1.23e-18']);

    // grouped inference
    formatsAs([0, 1, 2, 3], ['0', '1', '2', '3']);
    formatsAs(
      [3.14, null, NaN, 2.71828],
      ['3.14000', 'null', 'NaN', '2.71828']
    );
    formatsAs(
      [-4/3, -1, -2/3, 1/3, 1, 4/3, 5/3],
      ['-1.333', '-1.000', '-0.667', '0.333', '1.000', '1.333', '1.667'],
      { maxdigits: 3}
    );
    formatsAs(
      [-1.23e-18, 9.87654321e24, 1],
      ['-1.230000e-18', '9.876543e+24', '1.000000']
    );
  });

  it('formats date values', () => {
    formatsAs([utc(2000, 1, 1)], ['2000-01-01T00:00:00.000Z']);
    formatsAs(
      [utc(2000, 1, 1), utc(2001, 3, 14)],
      ['2000-01-01T00:00:00.000Z', '2001-03-14T00:00:00.000Z']
    );

    formatsAs([loc(2000, 1, 1)], ['2000-01-01T00:00:00.000']);
    formatsAs([loc(2005, 2, 3, 7, 11)], ['2005-02-03T07:11:00.000']);
    formatsAs([loc(2005, 2, 3, 7, 11, 0, 5)], ['2005-02-03T07:11:00.005']);
    formatsAs(
      [loc(2000, 1, 1), loc(2001, 3, 14)],
      ['2000-01-01T00:00:00.000', '2001-03-14T00:00:00.000']
    );
    formatsAs(
      [loc(2000, 1, 1), loc(2001, 3, 14), loc(2005, 2, 3, 7, 11)],
      ['2000-01-01T00:00:00.000', '2001-03-14T00:00:00.000', '2005-02-03T07:11:00.000']
    );

    formatsAs(
      [loc(2000, 1, 1), utc(2001, 3, 14)],
      ['2000-01-01T00:00:00.000', '2001-03-13T16:00:00.000']
    );
    formatsAs(
      [loc(2000, 1, 1), loc(2001, 3, 14), utc(2005, 2, 3, 7, 11)],
      ['2000-01-01T00:00:00.000', '2001-03-14T00:00:00.000', '2005-02-02T23:11:00.000']
    );
  });

  it('formats array values', () => {
    formatsAs([[1, 2, 3]], ['[1,2,3]']);
    formatsAs([Int32Array.of(1, 2, 3)], ['[1,2,3]']);
    formatsAs([Float32Array.of(1, 2, 3)], ['[1,2,3]']);

    formatsAs([['foo']], ['["foo"]']);
    formatsAs(
      [['foo boo goo woo soo loo roo']],
      ['["foo boo goo woo soo loo ro…]']
    );
  });

  it('formats object values', () => {
    formatsAs([{a:1}], ['{"a":1}']);
    formatsAs([{a:1}], ['{"a":1}']);
    formatsAs([{a: Int32Array.of(1, 2, 3)}], ['{"a":[1,2,3]}']);
    formatsAs(
      [{key: 'value', 'another key': 'another vlaue'}],
      ['{"key":"value","another key"…}']
    );
  });
});

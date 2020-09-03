import tape from 'tape';
import inferFormat from '../../src/format/infer';
import formatValue from '../../src/format/value';

function formatsAs(t, values, strings, options) {
  const opt = inferFormat(f => values.forEach(f), options);
  const out = values.map(v => formatValue(v, opt));
  t.deepEqual(out, strings, `formats [${strings.join(', ')}]`);
}

const loc = (y, m, d, H, M, S, u) =>
  new Date(y, m - 1, d, H || 0, M || 0, S || 0, u || 0);

const utc = (y, m, d, H, M, S, u) =>
  new Date(Date.UTC(y, m - 1, d, H || 0, M || 0, S || 0, u || 0));

tape('formatValue formats invalid values', t => {
  formatsAs(t, [NaN], ['NaN']);
  formatsAs(t, [null], ['null']);
  formatsAs(t, [undefined], ['undefined']);
  t.end();
});

tape('formatValue formats boolean values', t => {
  formatsAs(t, [true], ['true']);
  formatsAs(t, [false], ['false']);
  formatsAs(t, [true, false, null], ['true', 'false', 'null']);
  t.end();
});

tape('formatValue formats number values', t => {
  // integers
  formatsAs(t, [0], ['0']);
  formatsAs(t, [-0], ['0']);
  formatsAs(t, [1], ['1']);
  formatsAs(t, [-1], ['-1']);

  // decimals
  formatsAs(t, [Math.E], ['2.718282']);
  formatsAs(t, [3.14], ['3.14']);
  formatsAs(t, [1/3], ['0.3333'], { maxdigits: 4 });
  formatsAs(t, [1/3], ['0.333333'], { maxdigits: 6 });
  formatsAs(t, [1/3], ['0.33333333'], { maxdigits: 8 });
  formatsAs(t, [-1/3], ['-0.3333'], { maxdigits: 4 });
  formatsAs(t, [-1/3], ['-0.333333'], { maxdigits: 6 });
  formatsAs(t, [-1/3], ['-0.33333333'], { maxdigits: 8 });

  // fixed -> exponential
  formatsAs(t, [0.1], ['0.1'], { maxdigits: 4 });
  formatsAs(t, [0.01], ['0.01'], { maxdigits: 4 });
  formatsAs(t, [0.001], ['0.001'], { maxdigits: 4 });
  formatsAs(t, [0.0001], ['0.0001'], { maxdigits: 4 });
  formatsAs(t, [0.00001], ['1.0000e-5'], { maxdigits: 4 });
  formatsAs(t, [0.000001], ['1.0000e-6'], { maxdigits: 4 });
  formatsAs(t, [1e30], ['1e+30']);
  formatsAs(t, [-1e30], ['-1e+30']);
  formatsAs(t, [1.23e-18], ['1.23e-18']);
  formatsAs(t, [-1.23e-18], ['-1.23e-18']);

  // grouped inference
  formatsAs(t, [0, 1, 2, 3], ['0', '1', '2', '3']);
  formatsAs(t,
    [3.14, null, NaN, 2.71828],
    ['3.14000', 'null', 'NaN', '2.71828']
  );
  formatsAs(t,
    [-4/3, -1, -2/3, 1/3, 1, 4/3, 5/3],
    ['-1.333', '-1.000', '-0.667', '0.333', '1.000', '1.333', '1.667'],
    { maxdigits: 3}
  );
  formatsAs(t,
    [-1.23e-18, 9.87654321e24, 1],
    ['-1.230000e-18', '9.876543e+24', '1.000000']
  );

  t.end();
});

tape('formatValue formats date values', t => {
  formatsAs(t, [utc(2000, 1, 1)], ['2000-01-01 UTC']);
  formatsAs(t,
    [utc(2000, 1, 1), utc(2001, 3, 14)],
    ['2000-01-01 UTC', '2001-03-14 UTC']
  );

  formatsAs(t, [loc(2000, 1, 1)], ['2000-01-01']);
  formatsAs(t, [loc(2005, 2, 3, 7, 11)], ['2005-02-03 07:11:00']);
  formatsAs(t, [loc(2005, 2, 3, 7, 11, 0, 5)], ['2005-02-03 07:11:00']);
  formatsAs(t,
    [loc(2000, 1, 1), loc(2001, 3, 14)],
    ['2000-01-01', '2001-03-14']
  );
  formatsAs(t,
    [loc(2000, 1, 1), loc(2001, 3, 14), loc(2005, 2, 3, 7, 11)],
    ['2000-01-01 00:00:00', '2001-03-14 00:00:00', '2005-02-03 07:11:00']
  );

  t.end();
});

tape('formatValue formats array values', t => {
  formatsAs(t, [[1, 2, 3]], ['[1,2,3]']);
  formatsAs(t, [Int32Array.of(1, 2, 3)], ['[1,2,3]']);
  formatsAs(t, [Float32Array.of(1, 2, 3)], ['[1,2,3]']);

  formatsAs(t, [['foo']], ['["foo"]']);
  formatsAs(t,
    [['foo boo goo woo soo loo roo']],
    ['["foo boo goo woo soo loo ro…]']
  );

  t.end();
});

tape('formatValue formats object values', t => {
  formatsAs(t, [{a:1}], ['{"a":1}']);
  formatsAs(t, [{a:1}], ['{"a":1}']);
  formatsAs(t, [{a: Int32Array.of(1, 2, 3)}], ['{"a":[1,2,3]}']);
  formatsAs(t,
    [{key: 'value', 'another key': 'another vlaue'}],
    ['{"key":"value","another key"…}']
  );

  t.end();
});
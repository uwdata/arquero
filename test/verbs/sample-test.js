import tape from 'tape';
import { table } from '../../src/verbs';

function check(t, table, replace, prefix = '') {
  prefix = `${prefix}sample ${replace ? 'replace ' : ''}rows`;
  const vals = [];
  const cnts = {};
  table.scan((row, data) => {
    const val = data.a.get(row);
    vals.push(val);
    cnts[val] = (cnts[val] || 0) + 1;
  });

  t.ok(
    vals.every(v => v === 1 || v === 3 || v === 5 || v === 7),
    `${prefix} valid`
  );

  const test = replace
    ? Object.values(cnts).some(c => c > 1)
    : Object.values(cnts).every(c => c === 1);

  t.ok(test, `${prefix} count`);
}

tape('sample draws a sample without replacement', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols).sample(2);

  t.equal(ft.numRows(), 2, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  check(t, ft, false);
  t.end();
});

tape('sample draws a sample with replacement', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols).sample(10, { replace: true });

  t.equal(ft.numRows(), 10, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  check(t, ft, true);
  t.end();
});

tape('sample draws a column-weighted sample without replacement', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols).sample(2, { weight: 'a' });

  t.equal(ft.numRows(), 2, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  check(t, ft, false, 'weighted');
  t.end();
});

tape('sample draws an expression-weighted sample without replacement', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols).sample(2, { weight: d => d.a });

  t.equal(ft.numRows(), 2, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  check(t, ft, false, 'expr weighted');
  t.end();
});

tape('sample draws a weighted sample with replacement', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols).sample(10, { weight: 'a', replace: true });

  t.equal(ft.numRows(), 10, 'num rows');
  t.equal(ft.numCols(), 2, 'num cols');
  check(t, ft, true, 'weighted');
  t.end();
});

tape('sample tables support downstream transforms', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const dt = table(cols)
    .sample(10, { weight: 'a', replace: true })
    .filter(d => d.a > 1)
    .groupby(['a', 'b'])
    .count();

  t.equal(dt.numCols(), 3, 'num cols');
  t.end();
});
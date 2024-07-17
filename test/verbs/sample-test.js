import assert from 'node:assert';
import { frac, table } from '../../src/index.js';

function check(table, replace, prefix = '') {
  prefix = `${prefix}sample ${replace ? 'replace ' : ''}rows`;
  const vals = [];
  const cnts = {};
  table.scan((row, data) => {
    const val = data.a.at(row);
    vals.push(val);
    cnts[val] = (cnts[val] || 0) + 1;
  });

  assert.ok(
    vals.every(v => v === 1 || v === 3 || v === 5 || v === 7),
    `${prefix} valid`
  );

  const test = replace
    ? Object.values(cnts).some(c => c > 1)
    : Object.values(cnts).every(c => c === 1);

  assert.ok(test, `${prefix} count`);
}

describe('sample', () => {
  it('draws a sample without replacement', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(2);

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, false);
  });

  it('draws a maximal sample without replacement', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(10);

    assert.equal(ft.numRows(), 4, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, false);
  });

  it('draws a sample with replacement', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(10, { replace: true });

    assert.equal(ft.numRows(), 10, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, true);
  });

  it('draws a column-weighted sample without replacement', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(2, { weight: 'a' });

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, false, 'weighted ');
  });

  it('draws an expression-weighted sample without replacement', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(2, { weight: d => d.a });

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, false, 'expr weighted ');
  });

  it('draws a weighted sample with replacement', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(10, { weight: 'a', replace: true });

    assert.equal(ft.numRows(), 10, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, true, 'weighted ');
  });

  it('tables support downstream transforms', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const dt = table(cols)
      .sample(10, { weight: 'a', replace: true })
      .filter(d => d.a > 1)
      .groupby(['a', 'b'])
      .count();

    assert.equal(dt.numCols(), 3, 'num cols');
  });

  it('supports dynamic sample size', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols).sample(frac(0.5));

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    check(ft, false);
  });

  it('supports stratified sample', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 2, 4, 4]
    };

    const ft = table(cols).groupby('b').sample(1);

    assert.equal(ft.numRows(), 2, 'num rows');
    assert.equal(ft.numCols(), 2, 'num cols');
    assert.deepEqual(
      ft.column('b').sort((a, b) => a - b),
      [2, 4],
      'stratify keys'
    );
    check(ft, false);
  });
});

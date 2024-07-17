import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { op, table} from '../../src/index.js';

describe('parse with params', () => {
  it('supports table expression with parameter arg', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols)
      .params({ lo: 1, hi: 7 })
      .filter((d, $) => $.lo < d.a && d.a < $.hi)
      .reify();

    tableEqual(ft, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
    assert.deepEqual(ft.params(), { lo: 1, hi: 7 });
  });

  it('supports table expression with renamed parameter arg', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const t1 = table(cols)
      .params({ lo: 1, hi: 7 })
      .filter((d, _) => _.lo < d.a && d.a < _.hi)
      .reify();
    tableEqual(t1, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
    assert.deepEqual(t1.params(), { lo: 1, hi: 7 });

    const t2 = table(cols)
      .params({ lo: 1, hi: 7 })
      .filter((d, params) => op.equal(params.lo, d.a))
      .reify();
    tableEqual(t2, { a: [1], b: [2] }, 'parameter filtered data');
    assert.deepEqual(t2.params(), { lo: 1, hi: 7 });

    const t3 = table(cols)
      .params({ column: 'a' })
      .filter((d, p) => d[p.column] > 3)
      .reify();
    tableEqual(t3, { a: [5, 7], b: [6, 8] }, 'parameter filtered data');
    assert.deepEqual(t3.params(), { column: 'a' });
  });

  it('supports table expression with object pattern parameter arg', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const ft = table(cols)
      .params({ lo: 1, hi: 7 })
      .filter((d, { lo, hi }) => lo < d.a && d.a < hi)
      .reify();

    tableEqual(ft, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
    assert.deepEqual(ft.params(), { lo: 1, hi: 7 });
  });

  it('throws on table expression with nested object pattern parameter arg', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    assert.throws(() => {
      table(cols)
        .params({ thresh: {lo: 1, hi: 7} })
        .filter((d, { thresh: { lo, hi } }) => lo < d.a && d.a < hi);
    }, 'throws on nested argument destructuring');
  });

  it('supports table expression without parameter arg', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const lo = 1;
    const hi = 7;

    const ft = table(cols)
      .params({ lo, hi })
      .filter(d => lo < d.a && d.a < hi)
      .reify();

    tableEqual(ft, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
    assert.deepEqual(ft.params(), { lo: 1, hi: 7 });
  });

  it('supports table expression with object-valued parameter', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };

    const arr = [1, 7];
    const at = table(cols)
      .params({ arr })
      .filter(d => arr[0] < d.a && d.a < arr[1])
      .reify();
    tableEqual(at, { a: [3, 5], b: [4, 6] }, 'array parameter filtered data');
    assert.deepEqual(at.params(), { arr });

    const obj = { lo: 1, hi: 7 };
    const ot = table(cols)
      .params({ obj })
      .filter(d => obj.lo < d.a && d.a < obj.hi)
      .reify();
    tableEqual(ot, { a: [3, 5], b: [4, 6] }, 'object parameter filtered data');
    assert.deepEqual(ot.params(), { obj });
  });

  it('throws on invalid parameter', () => {
    const cols = {
      a: [1, 3, 5, 7],
      b: [2, 4, 6, 8]
    };
    assert.throws(
      () => { table(cols).filter((d, $) => $.lo < d.a && d.a < $.hi); },
      'throws on undefined parameter'
    );
  });
});

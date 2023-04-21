import tape from 'tape';
import tableEqual from '../table-equal';
import op from '../../src/op/op-api';
import { table } from '../../src/table';

tape('parse supports table expression with parameter arg', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols)
    .params({ lo: 1, hi: 7 })
    .filter((d, $) => $.lo < d.a && d.a < $.hi)
    .reify();

  tableEqual(t, ft, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
  t.deepEqual(ft.params(), { lo: 1, hi: 7 });
  t.end();
});

tape('parse supports table expression with renamed parameter arg', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const t1 = table(cols)
    .params({ lo: 1, hi: 7 })
    .filter((d, _) => _.lo < d.a && d.a < _.hi)
    .reify();
  tableEqual(t, t1, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
  t.deepEqual(t1.params(), { lo: 1, hi: 7 });

  const t2 = table(cols)
    .params({ lo: 1, hi: 7 })
    .filter((d, params) => op.equal(params.lo, d.a))
    .reify();
  tableEqual(t, t2, { a: [1], b: [2] }, 'parameter filtered data');
  t.deepEqual(t2.params(), { lo: 1, hi: 7 });

  const t3 = table(cols)
    .params({ column: 'a' })
    .filter((d, p) => d[p.column] > 3)
    .reify();
  tableEqual(t, t3, { a: [5, 7], b: [6, 8] }, 'parameter filtered data');
  t.deepEqual(t3.params(), { column: 'a' });

  t.end();
});

tape('parse supports table expression with object pattern parameter arg', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const ft = table(cols)
    .params({ lo: 1, hi: 7 })
    .filter((d, { lo, hi }) => lo < d.a && d.a < hi)
    .reify();

  tableEqual(t, ft, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
  t.deepEqual(ft.params(), { lo: 1, hi: 7 });
  t.end();
});

tape('parse throws on table expression with nested object pattern parameter arg', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  t.throws(() => {
    table(cols)
      .params({ thresh: {lo: 1, hi: 7} })
      .filter((d, { thresh: { lo, hi } }) => lo < d.a && d.a < hi);
  }, 'throws on nested argument destructuring');

  t.end();
});

tape('parse supports table expression without parameter arg', t => {
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

  tableEqual(t, ft, { a: [3, 5], b: [4, 6] }, 'parameter filtered data');
  t.deepEqual(ft.params(), { lo: 1, hi: 7 });
  t.end();
});

tape('parse supports table expression with object-valued parameter', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };

  const arr = [1, 7];
  const at = table(cols)
    .params({ arr })
    .filter(d => arr[0] < d.a && d.a < arr[1])
    .reify();
  tableEqual(t, at, { a: [3, 5], b: [4, 6] }, 'array parameter filtered data');
  t.deepEqual(at.params(), { arr });

  const obj = { lo: 1, hi: 7 };
  const ot = table(cols)
    .params({ obj })
    .filter(d => obj.lo < d.a && d.a < obj.hi)
    .reify();
  tableEqual(t, ot, { a: [3, 5], b: [4, 6] }, 'object parameter filtered data');
  t.deepEqual(ot.params(), { obj });

  t.end();
});

tape('parse throws on invalid parameter', t => {
  const cols = {
    a: [1, 3, 5, 7],
    b: [2, 4, 6, 8]
  };
  t.throws(
    () => { table(cols).filter((d, $) => $.lo < d.a && d.a < $.hi); },
    'throws on undefined parameter'
  );
  t.end();
});
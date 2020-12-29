import tape from 'tape';
import { query } from '../../src/query/query';
import { Verb, Verbs } from '../../src/query/verb';
import {
  all, bin, desc, endswith, matches, not, op, range, rolling, startswith
} from '../../src/verbs';
import { field, func } from './util';

const {
  count, dedupe, derive, filter, groupby, orderby,
  reify, rollup, sample, select, ungroup, unorder,
  relocate, impute, pivot, unroll, join, concat
} = Verbs;

function test(t, verb, expect, msg) {
  const object = verb.toObject();
  t.deepEqual(object, expect, msg);
  const rt = Verb.from(object).toObject();
  t.deepEqual(rt, expect, msg + ' round-trip');
}

tape('count verb serializes to object', t => {
  test(t,
    count(),
    {
      verb: 'count',
      options: undefined
    },
    'serialized count, no options'
  );

  test(t,
    count({ as: 'cnt' }),
    {
      verb: 'count',
      options: { as: 'cnt' }
    },
    'serialized count, with options'
  );

  t.end();
});

tape('dedupe verb serializes to object', t => {
  test(t,
    dedupe(),
    {
      verb: 'dedupe',
      keys: []
    },
    'serialized dedupe, no keys'
  );

  test(t,
    dedupe(['id', d => d.foo]),
    {
      verb: 'dedupe',
      keys: [
        'id',
        func('d => d.foo')
      ]
    },
    'serialized dedupe, with keys'
  );

  t.end();
});

tape('derive verb serializes to object', t => {
  const verb = derive(
    {
      foo: 'd.bar * 5',
      bar: d => d.foo + 1,
      baz: rolling(d => op.mean(d.foo), [-3, 3])
    },
    {
      before: 'bop'
    }
  );

  test(t,
    verb,
    {
      verb: 'derive',
      values: {
        foo: 'd.bar * 5',
        bar: func('d => d.foo + 1'),
        baz: func(
          'd => op.mean(d.foo)',
          { window: { frame: [ -3, 3 ], peers: false } }
        )
      },
      options: {
        before: 'bop'
      }
    },
    'serialized derive verb'
  );

  t.end();
});

tape('filter verb serializes to object', t => {
  test(t,
    filter(d => d.foo > 2),
    {
      verb: 'filter',
      criteria: func('d => d.foo > 2')
    },
    'serialized filter verb'
  );

  t.end();
});

tape('groupby verb serializes to object', t => {
  const verb = groupby([
    'foo',
    { baz: d => d.baz, bop: d => d.bop }
  ]);

  test(t,
    verb,
    {
      verb: 'groupby',
      keys: [
        'foo',
        {
          baz: func('d => d.baz'),
          bop: func('d => d.bop')
        }
      ]
    },
    'serialized groupby verb'
  );

  const binVerb = groupby([{ bin0: bin('foo') }]);

  test(t,
    binVerb,
    {
      verb: 'groupby',
      keys: [
        {
          bin0: 'd => op.bin(d["foo"], ...op.bins(d["foo"]), 0)'
        }
      ]
    },
    'serialized groupby verb, with binning'
  );

  t.end();
});

tape('orderby verb serializes to object', t => {
  const verb = orderby([
    1,
    'foo',
    desc('bar'),
    d => d.baz,
    desc(d => d.bop)
  ]);

  test(t,
    verb,
    {
      verb: 'orderby',
      keys: [
        1,
        field('foo'),
        field('bar', { desc: true }),
        func('d => d.baz'),
        func('d => d.bop', { desc: true })
      ]
    },
    'serialized orderby verb'
  );

  t.end();
});

tape('reify verb serializes to AST', t => {
  const verb = reify();

  test(t,
    verb,
    { verb: 'reify' },
    'serialized reify verb'
  );

  t.end();
});

tape('relocate verb serializes to object', t => {
  test(t,
    relocate(['foo', 'bar'], { before: 'baz' }),
    {
      verb: 'relocate',
      columns: ['foo', 'bar'],
      options: { before: 'baz' }
    },
    'serialized relocate verb'
  );

  test(t,
    relocate(not('foo'), { after: range('a', 'b') }),
    {
      verb: 'relocate',
      columns: { not: ['foo'] },
      options: { after: { range: ['a', 'b'] } }
    },
    'serialized relocate verb'
  );

  t.end();
});

tape('rollup verb serializes to object', t => {
  const verb = rollup({
    count: op.count(),
    sum: op.sum('bar'),
    mean: d => op.mean(d.foo)
  });

  test(t,
    verb,
    {
      verb: 'rollup',
      values: {
        count: func('d => op.count()'),
        sum: func('d => op.sum(d["bar"])'),
        mean: func('d => op.mean(d.foo)')
      }
    },
    'serialized rollup verb'
  );

  t.end();
});

tape('sample verb serializes to object', t => {
  test(t,
    sample(2, { replace: true }),
    {
      verb: 'sample',
      size: 2,
      options: { replace: true }
    },
    'serialized sample verb'
  );

  test(t,
    sample(() => op.count()),
    {
      verb: 'sample',
      size: { expr: '() => op.count()', func: true },
      options: undefined
    },
    'serialized sample verb, size function'
  );

  test(t,
    sample('() => op.count()'),
    {
      verb: 'sample',
      size: '() => op.count()',
      options: undefined
    },
    'serialized sample verb, size function as string'
  );

  test(t,
    sample(2, { weight: 'foo' }),
    {
      verb: 'sample',
      size: 2,
      options: { weight: 'foo' }
    },
    'serialized sample verb, weight column name'
  );

  test(t,
    sample(2, { weight: d => 2 * d.foo }),
    {
      verb: 'sample',
      size: 2,
      options: { weight: { expr: 'd => 2 * d.foo', func: true } }
    },
    'serialized sample verb, weight table expression'
  );

  t.end();
});

tape('select verb serializes to object', t => {
  const verb = select([
    'foo',
    'bar',
    { bop: 'boo', baz: 'bao' },
    all(),
    range(0, 1),
    range('a', 'b'),
    not('foo', 'bar', range(0, 1), range('a', 'b')),
    matches('foo.bar'),
    matches(/a|b/i),
    startswith('foo.'),
    endswith('.baz')
  ]);

  test(t,
    verb,
    {
      verb: 'select',
      columns: [
        'foo',
        'bar',
        { bop: 'boo', baz: 'bao' },
        { all: [] },
        { range: [0, 1] },
        { range: ['a', 'b'] },
        {
          not: [
            'foo',
            'bar',
            { range: [0, 1] },
            { range: ['a', 'b'] }
          ]
        },
        { matches: ['foo\\.bar', ''] },
        { matches: ['a|b', 'i'] },
        { matches: ['^foo\\.', ''] },
        { matches: ['\\.baz$', ''] }
      ]
    },
    'serialized select verb'
  );

  t.end();
});

tape('ungroup verb serializes to object', t => {
  test(t,
    ungroup(),
    { verb: 'ungroup' },
    'serialized ungroup verb'
  );

  t.end();
});

tape('unorder verb serializes to object', t => {
  test(t,
    unorder(),
    { verb: 'unorder' },
    'serialized unorder verb'
  );

  t.end();
});

tape('impute verb serializes to object', t => {
  const verb = impute(
    { v: () => 0 },
    { expand: 'x' }
  );

  test(t,
    verb,
    {
      verb: 'impute',
      values: {
        v: func('() => 0')
      },
      options: {
        expand: 'x'
      }
    },
    'serialized impute verb'
  );

  t.end();
});

tape('pivot verb serializes to object', t => {
  const verb = pivot(
    ['key'],
    ['value', { sum: d => op.sum(d.foo), prod: op.product('bar') }],
    { sort: false }
  );

  test(t,
    verb,
    {
      verb: 'pivot',
      keys: ['key'],
      values: [
        'value',
        {
          sum: func('d => op.sum(d.foo)'),
          prod: func('d => op.product(d["bar"])')
        }
      ],
      options: { sort: false }
    },
    'serialized pivot verb'
  );

  t.end();
});

tape('unroll verb serializes to object', t => {
  test(t,
    unroll(['foo', 1]),
    {
      verb: 'unroll',
      values: [ 'foo', 1 ],
      options: undefined
    },
    'serialized unroll verb'
  );

  test(t,
    unroll({
      foo: d => d.foo,
      bar: d => op.split(d.bar, ' ')
    }),
    {
      verb: 'unroll',
      values: {
        foo: { expr: 'd => d.foo', func: true },
        bar: { expr: 'd => op.split(d.bar, \' \')', func: true }
      },
      options: undefined
    },
    'serialized unroll verb, values object'
  );

  test(t,
    unroll(['foo'], { index: true }),
    {
      verb: 'unroll',
      values: [ 'foo' ],
      options: { index: true }
    },
    'serialized unroll verb, index boolean'
  );

  test(t,
    unroll(['foo'], { index: 'idxnum' }),
    {
      verb: 'unroll',
      values: [ 'foo' ],
      options: { index: 'idxnum' }
    },
    'serialized unroll verb, index string'
  );

  test(t,
    unroll(['foo'], { drop: [ 'bar' ] }),
    {
      verb: 'unroll',
      values: [ 'foo' ],
      options: { drop: [ 'bar' ] }
    },
    'serialized unroll verb, drop column name'
  );

  test(t,
    unroll(['foo'], { drop: d => d.bar }),
    {
      verb: 'unroll',
      values: [ 'foo' ],
      options: { drop: { expr: 'd => d.bar', func: true } }
    },
    'serialized unroll verb, drop table expression'
  );

  t.end();
});

tape('join verb serializes to object', t => {
  const verbSel = join(
    'tableRef',
    ['keyL', 'keyR'],
    [all(), not('keyR')],
    { suffix: ['_L', '_R'] }
  );

  test(t,
    verbSel,
    {
      verb: 'join',
      table: 'tableRef',
      on: [
        [field('keyL')],
        [field('keyR')]
      ],
      values: [
        [ { all: [] } ],
        [ { not: ['keyR'] } ]
      ],
      options: { suffix: ['_L', '_R'] }
    },
    'serialized join verb, column selections'
  );

  const verbCols = join(
    'tableRef',
    [
      [d => d.keyL],
      [d => d.keyR]
    ],
    [
      ['keyL', 'valL', { foo: d => 1 + d.valL }],
      ['valR', { bar: d => 2 * d.valR }]
    ],
    { suffix: ['_L', '_R'] }
  );

  test(t,
    verbCols,
    {
      verb: 'join',
      table: 'tableRef',
      on: [
        [ func('d => d.keyL') ],
        [ func('d => d.keyR') ]
      ],
      values: [
        ['keyL', 'valL', { foo: func('d => 1 + d.valL') } ],
        ['valR', { bar: func('d => 2 * d.valR') }]
      ],
      options: { suffix: ['_L', '_R'] }
    },
    'serialized join verb, column lists'
  );

  const verbExpr = join(
    'tableRef',
    (a, b) => op.equal(a.keyL, b.keyR),
    {
      key: a => a.keyL,
      foo: a => a.foo,
      bar: (a, b) => b.bar
    }
  );

  test(t,
    verbExpr,
    {
      verb: 'join',
      table: 'tableRef',
      on: func('(a, b) => op.equal(a.keyL, b.keyR)'),
      values: {
        key: func('a => a.keyL'),
        foo: func('a => a.foo'),
        bar: func('(a, b) => b.bar')
      },
      options: undefined
    },
    'serialized join verb, table expressions'
  );

  t.end();
});

tape('concat verb serializes to object', t => {
  test(t,
    concat(['foo', 'bar']),
    {
      verb: 'concat',
      tables: ['foo', 'bar']
    },
    'serialized concat verb'
  );

  const ct1 = query('foo').select(not('bar'));
  const ct2 = query('bar').select(not('foo'));

  test(t,
    concat([ct1, ct2]),
    {
      verb: 'concat',
      tables: [ ct1.toObject(), ct2.toObject() ]
    },
    'serialized concat verb, with subqueries'
  );

  t.end();
});
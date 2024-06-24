import assert from 'node:assert';
import { query } from '../../src/query/query.js';
import { Verb, Verbs } from '../../src/query/verb.js';
import {
  all, bin, desc, endswith, matches, not, op, range, rolling, startswith
} from '../../src/index.js';
import { field, func } from './util.js';

const {
  count, dedupe, derive, filter, groupby, orderby,
  reify, rollup, sample, select, ungroup, unorder,
  relocate, rename, impute, pivot, unroll, join, concat
} = Verbs;

function test(verb, expect, msg) {
  const object = verb.toObject();
  assert.deepEqual(object, expect, msg);
  const rt = Verb.from(object).toObject();
  assert.deepEqual(rt, expect, msg + ' round-trip');
}

describe('serialize', () => {
  it('count verb serializes to object', () => {
    test(
      count(),
      {
        verb: 'count',
        options: undefined
      },
      'serialized count, no options'
    );

    test(
      count({ as: 'cnt' }),
      {
        verb: 'count',
        options: { as: 'cnt' }
      },
      'serialized count, with options'
    );
  });

  it('dedupe verb serializes to object', () => {
    test(
      dedupe(),
      {
        verb: 'dedupe',
        keys: []
      },
      'serialized dedupe, no keys'
    );

    test(
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
  });

  it('derive verb serializes to object', () => {
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

    test(
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
  });

  it('filter verb serializes to object', () => {
    test(
      filter(d => d.foo > 2),
      {
        verb: 'filter',
        criteria: func('d => d.foo > 2')
      },
      'serialized filter verb'
    );
  });

  it('groupby verb serializes to object', () => {
    const verb = groupby([
      'foo',
      { baz: d => d.baz, bop: d => d.bop }
    ]);

    test(
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

    test(
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
  });

  it('orderby verb serializes to object', () => {
    const verb = orderby([
      1,
      'foo',
      desc('bar'),
      d => d.baz,
      desc(d => d.bop)
    ]);

    test(
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
  });

  it('reify verb serializes to AST', () => {
    const verb = reify();

    test(
      verb,
      { verb: 'reify' },
      'serialized reify verb'
    );
  });

  it('relocate verb serializes to object', () => {
    test(
      relocate(['foo', 'bar'], { before: 'baz' }),
      {
        verb: 'relocate',
        columns: ['foo', 'bar'],
        options: { before: 'baz' }
      },
      'serialized relocate verb'
    );

    test(
      relocate(not('foo'), { after: range('a', 'b') }),
      {
        verb: 'relocate',
        columns: { not: ['foo'] },
        options: { after: { range: ['a', 'b'] } }
      },
      'serialized relocate verb'
    );
  });

  it('rename verb serializes to object', () => {
    test(
      rename([{ foo: 'bar' }]),
      {
        verb: 'rename',
        columns: [{ foo: 'bar' }]
      },
      'serialized rename verb'
    );

    test(
      rename([{ foo: 'bar' }, { baz: 'bop' }]),
      {
        verb: 'rename',
        columns: [{ foo: 'bar' }, { baz: 'bop' }]
      },
      'serialized rename verb'
    );
  });

  it('rollup verb serializes to object', () => {
    const verb = rollup({
      count: op.count(),
      sum: op.sum('bar'),
      mean: d => op.mean(d.foo)
    });

    test(
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
  });

  it('sample verb serializes to object', () => {
    test(
      sample(2, { replace: true }),
      {
        verb: 'sample',
        size: 2,
        options: { replace: true }
      },
      'serialized sample verb'
    );

    test(
      sample(() => op.count()),
      {
        verb: 'sample',
        size: { expr: '() => op.count()', func: true },
        options: undefined
      },
      'serialized sample verb, size function'
    );

    test(
      sample('() => op.count()'),
      {
        verb: 'sample',
        size: '() => op.count()',
        options: undefined
      },
      'serialized sample verb, size function as string'
    );

    test(
      sample(2, { weight: 'foo' }),
      {
        verb: 'sample',
        size: 2,
        options: { weight: 'foo' }
      },
      'serialized sample verb, weight column name'
    );

    test(
      sample(2, { weight: d => 2 * d.foo }),
      {
        verb: 'sample',
        size: 2,
        options: { weight: { expr: 'd => 2 * d.foo', func: true } }
      },
      'serialized sample verb, weight table expression'
    );
  });

  it('select verb serializes to object', () => {
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

    test(
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
  });

  it('ungroup verb serializes to object', () => {
    test(
      ungroup(),
      { verb: 'ungroup' },
      'serialized ungroup verb'
    );
  });

  it('unorder verb serializes to object', () => {
    test(
      unorder(),
      { verb: 'unorder' },
      'serialized unorder verb'
    );
  });

  it('impute verb serializes to object', () => {
    const verb = impute(
      { v: () => 0 },
      { expand: 'x' }
    );

    test(
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
  });

  it('pivot verb serializes to object', () => {
    const verb = pivot(
      ['key'],
      ['value', { sum: d => op.sum(d.foo), prod: op.product('bar') }],
      { sort: false }
    );

    test(
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
  });

  it('unroll verb serializes to object', () => {
    test(
      unroll(['foo', 1]),
      {
        verb: 'unroll',
        values: [ 'foo', 1 ],
        options: undefined
      },
      'serialized unroll verb'
    );

    test(
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

    test(
      unroll(['foo'], { index: true }),
      {
        verb: 'unroll',
        values: [ 'foo' ],
        options: { index: true }
      },
      'serialized unroll verb, index boolean'
    );

    test(
      unroll(['foo'], { index: 'idxnum' }),
      {
        verb: 'unroll',
        values: [ 'foo' ],
        options: { index: 'idxnum' }
      },
      'serialized unroll verb, index string'
    );

    test(
      unroll(['foo'], { drop: [ 'bar' ] }),
      {
        verb: 'unroll',
        values: [ 'foo' ],
        options: { drop: [ 'bar' ] }
      },
      'serialized unroll verb, drop column name'
    );

    test(
      unroll(['foo'], { drop: d => d.bar }),
      {
        verb: 'unroll',
        values: [ 'foo' ],
        options: { drop: { expr: 'd => d.bar', func: true } }
      },
      'serialized unroll verb, drop table expression'
    );
  });

  it('join verb serializes to object', () => {
    const verbSel = join(
      'tableRef',
      ['keyL', 'keyR'],
      [all(), not('keyR')],
      { suffix: ['_L', '_R'] }
    );

    test(
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

    test(
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

    test(
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
  });

  it('concat verb serializes to object', () => {
    test(
      concat(['foo', 'bar']),
      {
        verb: 'concat',
        tables: ['foo', 'bar']
      },
      'serialized concat verb'
    );

    const ct1 = query('foo').select(not('bar'));
    const ct2 = query('bar').select(not('foo'));

    test(
      concat([ct1, ct2]),
      {
        verb: 'concat',
        tables: [ ct1.toObject(), ct2.toObject() ]
      },
      'serialized concat verb, with subqueries'
    );
  });
});

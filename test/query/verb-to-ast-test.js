import assert from 'node:assert';
import { query } from '../../src/query/query.js';
import { Verbs } from '../../src/query/verb.js';
import {
  all, bin, desc, endswith, matches, not, op, range, rolling, startswith
} from '../../src/index.js';

const {
  count, dedupe, derive, filter, groupby, orderby,
  reify, rollup, sample, select, ungroup, unorder,
  relocate, rename, impute, pivot, unroll, join, concat
} = Verbs;

function toAST(verb) {
  return JSON.parse(JSON.stringify(verb.toAST()));
}

describe('serialize to AST', () => {
  it('count verb serializes to AST', () => {
    assert.deepEqual(
      toAST(count()),
      { type: 'Verb', verb: 'count' },
      'ast count, no options'
    );

    assert.deepEqual(
      toAST(count({ as: 'cnt' })),
      {
        type: 'Verb',
        verb: 'count',
        options: { as: 'cnt' }
      },
      'ast count, with options'
    );
  });

  it('dedupe verb serializes to AST', () => {
    assert.deepEqual(
      toAST(dedupe()),
      {
        type: 'Verb',
        verb: 'dedupe',
        keys: []
      },
      'ast dedupe, no keys'
    );

    assert.deepEqual(
      toAST(dedupe(['id', d => d.foo, d => Math.abs(d.bar)])),
      {
        type: 'Verb',
        verb: 'dedupe',
        keys: [
          { type: 'Column', name: 'id' },
          { type: 'Column', name: 'foo' },
          {
            type: 'CallExpression',
            callee: { type: 'Function', name: 'abs' },
            arguments: [ { type: 'Column', name: 'bar' } ]
          }
        ]
      },
      'ast dedupe, with keys'
    );
  });

  it('derive verb serializes to AST', () => {
    const verb = derive(
      {
        col: d => d.foo,
        foo: 'd.bar * 5',
        bar: d => d.foo + 1,
        baz: rolling(d => op.mean(d.foo), [-3, 3])
      },
      {
        before: 'bop'
      }
    );

    assert.deepEqual(
      toAST(verb),
      {
        type: 'Verb',
        verb: 'derive',
        values: [
          { type: 'Column', name: 'foo', as: 'col' },
          {
            type: 'BinaryExpression',
            left: { type: 'Column', name: 'bar' },
            operator: '*',
            right: { type: 'Literal', value: 5, raw: '5' },
            as: 'foo'
          },
          {
            type: 'BinaryExpression',
            left: { type: 'Column', name: 'foo' },
            operator: '+',
            right: { type: 'Literal', value: 1, raw: '1' },
            as: 'bar'
          },
          {
            type: 'Window',
            frame: [ -3, 3 ],
            peers: false,
            expr: {
              type: 'CallExpression',
              callee: { type: 'Function', name: 'mean' },
              arguments: [ { type: 'Column', name: 'foo' } ]
            },
            as: 'baz'
          }
        ],
        options: {
          before: [
            { type: 'Column', name: 'bop' }
          ]
        }
      },
      'ast derive verb'
    );
  });

  it('filter verb serializes to AST', () => {
    const ast = {
      type: 'Verb',
      verb: 'filter',
      criteria: {
        type: 'BinaryExpression',
        left: { type: 'Column', name: 'foo' },
        operator: '>',
        right: { type: 'Literal', value: 2, raw: '2' }
      }
    };

    assert.deepEqual(
      toAST(filter(d => d.foo > 2)),
      ast,
      'ast filter verb'
    );

    assert.deepEqual(
      toAST(filter('d.foo > 2')),
      ast,
      'ast filter verb, expr string'
    );
  });

  it('groupby verb serializes to AST', () => {
    assert.deepEqual(
      toAST(groupby([
        'foo',
        1,
        { baz: d => d.baz, bop: d => d.bop, bar: d => Math.abs(d.bar) }
      ])),
      {
        type: 'Verb',
        verb: 'groupby',
        keys: [
          { type: 'Column', name: 'foo' },
          { type: 'Column', index: 1 },
          { type: 'Column', name: 'baz', as: 'baz' },
          { type: 'Column', name: 'bop', as: 'bop' },
          {
            type: 'CallExpression',
            callee: { type: 'Function', name: 'abs' },
            arguments: [ { type: 'Column', name: 'bar' } ],
            as: 'bar'
          }
        ]
      },
      'ast groupby verb'
    );

    assert.deepEqual(
      toAST(groupby([{ bin0: bin('foo') }])),
      {
        type: 'Verb',
        verb: 'groupby',
        keys: [
          {
            as: 'bin0',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'bin' },
            arguments: [
              { type: 'Column', name: 'foo' },
              {
                type: 'SpreadElement',
                argument: {
                  type: 'CallExpression',
                  callee: { type: 'Function', name: 'bins' },
                  arguments: [{ type: 'Column', name: 'foo' }]
                }
              },
              { type: 'Literal', value: 0, raw: '0' }
            ]
          }
        ]
      },
      'ast groupby verb, with binning'
    );
  });

  it('orderby verb serializes to AST', () => {
    const verb = orderby([
      1,
      'foo',
      desc('bar'),
      d => d.baz,
      desc(d => d.bop)
    ]);

    assert.deepEqual(
      toAST(verb),
      {
        type: 'Verb',
        verb: 'orderby',
        keys:  [
          { type: 'Column', index: 1 },
          { type: 'Column', name: 'foo' },
          { type: 'Descending', expr: { type: 'Column', name: 'bar' } },
          { type: 'Column', name: 'baz' },
          { type: 'Descending', expr: { type: 'Column', name: 'bop' } }
        ]
      },
      'ast orderby verb'
    );
  });

  it('reify verb serializes to AST', () => {
    const verb = reify();

    assert.deepEqual(
      toAST(verb),
      { type: 'Verb', verb: 'reify' },
      'ast reify verb'
    );
  });

  it('relocate verb serializes to AST', () => {
    assert.deepEqual(
      toAST(relocate(['foo', 'bar'], { before: 'baz' })),
      {
        type: 'Verb',
        verb: 'relocate',
        columns: [
          { type: 'Column', name: 'foo' },
          { type: 'Column', name: 'bar' }
        ],
        options: {
          before: [ { type: 'Column', name: 'baz' } ]
        }
      },
      'ast relocate verb'
    );

    assert.deepEqual(
      toAST(relocate(not('foo'), { after: range('a', 'b') })),
      {
        type: 'Verb',
        verb: 'relocate',
        columns: [
          {
            type: 'Selection',
            operator: 'not',
            arguments: [ { type: 'Column', name: 'foo' } ]
          }
        ],
        options: {
          after: [
            {
              type: 'Selection',
              operator: 'range',
              arguments: [
                { type: 'Column', name: 'a' },
                { type: 'Column', name: 'b' }
              ]
            }
          ]
        }
      },
      'ast relocate verb'
    );
  });

  it('rename verb serializes to AST', () => {
    assert.deepEqual(
      toAST(rename([{ foo: 'bar' }])),
      {
        type: 'Verb',
        verb: 'rename',
        columns: [
          { type: 'Column', name: 'foo', as: 'bar' }
        ]
      },
      'ast rename verb'
    );

    assert.deepEqual(
      toAST(rename([{ foo: 'bar' }, { baz: 'bop' }])),
      {
        type: 'Verb',
        verb: 'rename',
        columns: [
          { type: 'Column', name: 'foo', as: 'bar' },
          { type: 'Column', name: 'baz', as: 'bop' }
        ]
      },
      'ast rename verb'
    );
  });

  it('rollup verb serializes to AST', () => {
    const verb = rollup({
      count: op.count(),
      sum: op.sum('bar'),
      mean: d => op.mean(d.foo)
    });

    assert.deepEqual(
      toAST(verb),
      {
        type: 'Verb',
        verb: 'rollup',
        values: [
          {
            as: 'count',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'count' },
            arguments: []
          },
          {
            as: 'sum',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'sum' },
            arguments: [{ type: 'Column', name: 'bar' } ]
          },
          {
            as: 'mean',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'mean' },
            arguments: [ { type: 'Column', name: 'foo' } ]
          }
        ]
      },
      'ast rollup verb'
    );
  });

  it('sample verb serializes to AST', () => {
    assert.deepEqual(
      toAST(sample(2, { replace: true })),
      {
        type: 'Verb',
        verb: 'sample',
        size: 2,
        options: { replace: true }
      },
      'ast sample verb'
    );

    assert.deepEqual(
      toAST(sample(() => op.count())),
      {
        type: 'Verb',
        verb: 'sample',
        size: {
          type: 'CallExpression',
          callee: { type: 'Function', name: 'count' },
          arguments: []
        }
      },
      'ast sample verb, size function'
    );

    assert.deepEqual(
      toAST(sample('() => op.count()')),
      {
        type: 'Verb',
        verb: 'sample',
        size: {
          type: 'CallExpression',
          callee: { type: 'Function', name: 'count' },
          arguments: []
        }
      },
      'ast sample verb, size function as string'
    );

    assert.deepEqual(
      toAST(sample(2, { weight: 'foo' })),
      {
        type: 'Verb',
        verb: 'sample',
        size: 2,
        options: { weight: { type: 'Column', name: 'foo' } }
      },
      'ast sample verb, weight column name'
    );

    assert.deepEqual(
      toAST(sample(2, { weight: d => 2 * d.foo })),
      {
        type: 'Verb',
        verb: 'sample',
        size: 2,
        options: {
          weight: {
            type: 'BinaryExpression',
            left: { type: 'Literal', value: 2, raw: '2' },
            operator: '*',
            right: { type: 'Column', name: 'foo' }
          }
        }
      },
      'ast sample verb, weight table expression'
    );
  });

  it('select verb serializes to AST', () => {
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

    assert.deepEqual(
      toAST(verb),
      {
        type: 'Verb',
        verb: 'select',
        columns: [
          { type: 'Column', name: 'foo' },
          { type: 'Column', name: 'bar' },
          { type: 'Column', name: 'bop', as: 'boo' },
          { type: 'Column', name: 'baz', as: 'bao' },
          { type: 'Selection', operator: 'all' },
          {
            type: 'Selection',
            operator: 'range',
            arguments: [
              { type: 'Column', index: 0 },
              { type: 'Column', index: 1 }
            ]
          },
          {
            type: 'Selection',
            operator: 'range',
            arguments: [
              { type: 'Column', name: 'a' },
              { type: 'Column', name: 'b' }
            ]
          },
          {
            type: 'Selection',
            operator: 'not',
            arguments: [
              { type: 'Column', name: 'foo' },
              { type: 'Column', name: 'bar' },
              {
                type: 'Selection',
                operator: 'range',
                arguments: [
                  { type: 'Column', index: 0 },
                  { type: 'Column', index: 1 }
                ]
              },
              {
                type: 'Selection',
                operator: 'range',
                arguments: [
                  { type: 'Column', name: 'a' },
                  { type: 'Column', name: 'b' }
                ]
              }
            ]
          },
          {
            type: 'Selection',
            operator: 'matches',
            arguments: [ 'foo\\.bar', '' ]
          },
          {
            type: 'Selection',
            operator: 'matches',
            arguments: [ 'a|b', 'i' ]
          },
          {
            type: 'Selection',
            operator: 'matches',
            arguments: [ '^foo\\.', '' ]
          },
          {
            type: 'Selection',
            operator: 'matches',
            arguments: [ '\\.baz$', '' ]
          }
        ]
      },
      'ast select verb'
    );
  });

  it('ungroup verb serializes to AST', () => {
    const verb = ungroup();

    assert.deepEqual(
      toAST(verb),
      { type: 'Verb', verb: 'ungroup' },
      'ast ungroup verb'
    );
  });

  it('unorder verb serializes to AST', () => {
    const verb = unorder();

    assert.deepEqual(
      toAST(verb),
      { type: 'Verb', verb: 'unorder' },
      'ast unorder verb'
    );
  });

  it('pivot verb serializes to AST', () => {
    const verb = pivot(
      ['key'],
      ['value', { sum: d => op.sum(d.foo), prod: op.product('bar') }],
      { sort: false }
    );

    assert.deepEqual(
      toAST(verb),
      {
        type: 'Verb',
        verb: 'pivot',
        keys: [ { type: 'Column', name: 'key' } ],
        values: [
          { type: 'Column', name: 'value' },
          {
            as: 'sum',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'sum' },
            arguments: [ { type: 'Column', name: 'foo' } ]
          },
          {
            as: 'prod',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'product' },
            arguments: [ { type: 'Column', name: 'bar' } ]
          }
        ],
        options: { sort: false }
      },
      'ast pivot verb'
    );
  });

  it('impute verb serializes to AST', () => {
    const verb = impute(
      { v: () => 0 },
      { expand: 'x' }
    );

    assert.deepEqual(
      toAST(verb),
      {
        type: 'Verb',
        verb: 'impute',
        values: [ { as: 'v', type: 'Literal', raw: '0', value: 0 } ],
        options: { expand: [ { type: 'Column', name: 'x' } ] }
      },
      'ast impute verb'
    );
  });

  it('unroll verb serializes to AST', () => {
    assert.deepEqual(
      toAST(unroll(['foo', 1])),
      {
        type: 'Verb',
        verb: 'unroll',
        values: [
          { type: 'Column', name: 'foo' },
          { type: 'Column', index: 1 }
        ]
      },
      'ast unroll verb'
    );

    assert.deepEqual(
      toAST(unroll({
        foo: d => d.foo,
        bar: d => op.split(d.bar, ' ')
      })),
      {
        type: 'Verb',
        verb: 'unroll',
        values: [
          { type: 'Column', name: 'foo', as: 'foo' },
          {
            as: 'bar',
            type: 'CallExpression',
            callee: { type: 'Function', name: 'split' },
            arguments: [
              { type: 'Column', name: 'bar' },
              { type: 'Literal', value: ' ', raw: '\' \'' }
            ]
          }
        ]
      },
      'ast unroll verb, values object'
    );

    assert.deepEqual(
      toAST(unroll(['foo'], { index: true })),
      {
        type: 'Verb',
        verb: 'unroll',
        values: [ { type: 'Column', name: 'foo' } ],
        options: { index: true }
      },
      'ast unroll verb, index boolean'
    );

    assert.deepEqual(
      toAST(unroll(['foo'], { index: 'idxnum' })),
      {
        type: 'Verb',
        verb: 'unroll',
        values: [ { type: 'Column', name: 'foo' } ],
        options: { index: 'idxnum' }
      },
      'ast unroll verb, index string'
    );

    assert.deepEqual(
      toAST(unroll(['foo'], { drop: [ 'bar' ] })),
      {
        type: 'Verb',
        verb: 'unroll',
        values: [ { type: 'Column', name: 'foo' } ],
        options: {
          drop: [ { type: 'Column', name: 'bar' } ]
        }
      },
      'ast unroll verb, drop column name'
    );

    assert.deepEqual(
      toAST(unroll(['foo'], { drop: d => d.bar })),
      {
        type: 'Verb',
        verb: 'unroll',
        values: [ { type: 'Column', name: 'foo' } ],
        options: {
          drop: [ { type: 'Column', name: 'bar' } ]
        }
      },
      'ast unroll verb, drop table expression'
    );
  });

  it('join verb serializes to AST', () => {
    const verbSel = join(
      'tableRef',
      ['keyL', 'keyR'],
      [all(), not('keyR')],
      { suffix: ['_L', '_R'] }
    );

    assert.deepEqual(
      toAST(verbSel),
      {
        type: 'Verb',
        verb: 'join',
        table: 'tableRef',
        on: [
          [ { type: 'Column', name: 'keyL' } ],
          [ { type: 'Column', name: 'keyR' } ]
        ],
        values: [
          [ { type: 'Selection', operator: 'all' } ],
          [ {
            type: 'Selection',
            operator: 'not',
            arguments: [ { type: 'Column', name: 'keyR' } ]
          } ]
        ],
        options: { suffix: ['_L', '_R'] }
      },
      'ast join verb, column selections'
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

    assert.deepEqual(
      toAST(verbCols),
      {
        type: 'Verb',
        verb: 'join',
        table: 'tableRef',
        on: [
          [ { type: 'Column', name: 'keyL' } ],
          [ { type: 'Column', name: 'keyR' } ]
        ],
        values: [
          [
            { type: 'Column', name: 'keyL' },
            { type: 'Column', name: 'valL' },
            {
              as: 'foo',
              type: 'BinaryExpression',
              left: { type: 'Literal', 'value': 1, 'raw': '1' },
              operator: '+',
              right: { type: 'Column', name: 'valL' }
            }
          ],
          [
            { type: 'Column', name: 'valR' },
            {
              as: 'bar',
              type: 'BinaryExpression',
              left: { type: 'Literal', 'value': 2, 'raw': '2' },
              operator: '*',
              right: { type: 'Column', name: 'valR' }
            }
          ]
        ],
        options: { suffix: ['_L', '_R'] }
      },
      'ast join verb, column lists'
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

    assert.deepEqual(
      toAST(verbExpr),
      {
        type: 'Verb',
        verb: 'join',
        table: 'tableRef',
        on: {
          type: 'CallExpression',
          callee: { type: 'Function', name: 'equal' },
          arguments: [
            { type: 'Column', table: 1, name: 'keyL' },
            { type: 'Column', table: 2, name: 'keyR' }
          ]
        },
        values: [
          { type: 'Column', table: 1, name: 'keyL', as: 'key' },
          { type: 'Column', table: 1, name: 'foo', as: 'foo' },
          { type: 'Column', table: 2, name: 'bar', as: 'bar' }
        ]
      },
      'ast join verb, table expressions'
    );
  });

  it('concat verb serializes to AST', () => {
    assert.deepEqual(
      toAST(concat(['foo', 'bar'])),
      {
        type: 'Verb',
        verb: 'concat',
        tables: ['foo', 'bar']
      },
      'ast concat verb'
    );

    const ct1 = query('foo').select(not('bar'));
    const ct2 = query('bar').select(not('foo'));

    assert.deepEqual(
      toAST(concat([ct1, ct2])),
      {
        type: 'Verb',
        verb: 'concat',
        tables: [
          {
            type: 'Query',
            verbs: [
              {
                type: 'Verb',
                verb: 'select',
                columns: [
                  {
                    type: 'Selection',
                    operator: 'not',
                    arguments: [ { type: 'Column', name: 'bar' } ]
                  }
                ]
              }
            ],
            table: 'foo'
          },
          {
            type: 'Query',
            verbs: [
              {
                type: 'Verb',
                verb: 'select',
                columns: [
                  {
                    type: 'Selection',
                    operator: 'not',
                    arguments: [ { type: 'Column', name: 'foo' } ]
                  }
                ]
              }
            ],
            table: 'bar'
          }
        ]
      },
      'ast concat verb, with subqueries'
    );
  });
});

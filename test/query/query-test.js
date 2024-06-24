import assert from 'node:assert';
import groupbyEqual from '../groupby-equal.js';
import tableEqual from '../table-equal.js';
import Query, { query } from '../../src/query/query.js';
import { Verbs } from '../../src/query/verb.js';
import isFunction from '../../src/util/is-function.js';
import { all, desc, not, op, range, rolling, seed, table } from '../../src/index.js';
import { field, func } from './util.js';

const {
  count, dedupe, derive, filter, groupby, orderby,
  reify, rollup, select, sample, ungroup, unorder,
  relocate, rename, impute, fold, pivot, spread, unroll,
  cross, join, semijoin, antijoin,
  concat, union, except, intersect
} = Verbs;

describe('Query', () => {
  it('builds single-table queries', () => {
    const q = query()
      .derive({ bar: d => d.foo + 1 })
      .rollup({ count: op.count(), sum: op.sum('bar') })
      .orderby('foo', desc('bar'), d => d.baz, desc(d => d.bop))
      .groupby('foo', { baz: d => d.baz, bop: d => d.bop });

    assert.deepEqual(q.toObject(), {
      verbs: [
        {
          verb: 'derive',
          values: { bar: func('d => d.foo + 1') },
          options: undefined
        },
        {
          verb: 'rollup',
          values: {
            count: func('d => op.count()'),
            sum: func('d => op.sum(d["bar"])')
          }
        },
        {
          verb: 'orderby',
          keys: [
            field('foo'),
            field('bar', { desc: true }),
            func('d => d.baz'),
            func('d => d.bop', { desc: true })
          ]
        },
        {
          verb: 'groupby',
          keys: [
            'foo',
            {
              baz: func('d => d.baz'),
              bop: func('d => d.bop')
            }
          ]
        }
      ]
    }, 'serialized query from builder');
  });

  it('supports multi-table verbs', () => {
    const q = query()
      .concat('concat_table')
      .join('join_table');

    assert.deepEqual(q.toObject(), {
      verbs: [
        {
          verb: 'concat',
          tables: ['concat_table']
        },
        {
          verb: 'join',
          table: 'join_table',
          on: undefined,
          values: undefined,
          options: undefined
        }
      ]
    }, 'serialized query from builder');
  });

  it('supports multi-table queries', () => {
    const qc = query('concat_table')
      .select(not('foo'));

    const qj = query('join_table')
      .select(not('bar'));

    const q = query()
      .concat(qc)
      .join(qj);

    assert.deepEqual(q.toObject(), {
      verbs: [
        {
          verb: 'concat',
          tables: [ qc.toObject() ]
        },
        {
          verb: 'join',
          table: qj.toObject(),
          on: undefined,
          values: undefined,
          options: undefined
        }
      ]
    }, 'serialized query from builder');
  });

  it('supports all defined verbs', () => {
    const verbs = Object.keys(Verbs);
    const q = query();
    assert.equal(
      verbs.filter(v => isFunction(q[v])).length,
      verbs.length,
      'query builder supports all verbs'
    );
  });

  it('serializes to objects', () => {
    const q = new Query([
      derive({ bar: d => d.foo + 1 }),
      rollup({
        count: op.count(),
        sum: op.sum('bar')
      }),
      orderby(['foo', desc('bar'), d => d.baz, desc(d => d.bop)]),
      groupby(['foo', { baz: d => d.baz, bop: d => d.bop }])
    ]);

    assert.deepEqual(q.toObject(), {
      verbs: [
        {
          verb: 'derive',
          values: { bar: func('d => d.foo + 1') },
          options: undefined
        },
        {
          verb: 'rollup',
          values: {
            count: func('d => op.count()'),
            sum: func('d => op.sum(d["bar"])')
          }
        },
        {
          verb: 'orderby',
          keys: [
            field('foo'),
            field('bar', { desc: true }),
            func('d => d.baz'),
            func('d => d.bop', { desc: true })
          ]
        },
        {
          verb: 'groupby',
          keys: [
            'foo',
            {
              baz: func('d => d.baz'),
              bop: func('d => d.bop')
            }
          ]
        }
      ]
    }, 'serialized query');
  });

  it('evaluates unmodified inputs', () => {
    const q = new Query([
      derive({ bar: (d, $) => d.foo + $.offset }),
      rollup({ count: op.count(), sum: op.sum('bar') })
    ], { offset: 1});

    const dt = table({ foo: [0, 1, 2, 3] });
    const dr = q.evaluate(dt);

    tableEqual(dr, { count: [4], sum: [10] }, 'query data');
  });

  it('evaluates serialized inputs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([
          derive({ baz: (d, $) => d.foo + $.offset }),
          orderby(['bar', 0]),
          select([not('bar')])
        ], { offset: 1 }).toObject()
      ).evaluate(dt),
      { foo: [ 2, 3, 0, 1 ], baz: [ 3, 4, 1, 2 ] },
      'serialized query data'
    );

    tableEqual(
      Query.from(
        new Query([
          derive({ bar: (d, $) => d.foo + $.offset }),
          rollup({ count: op.count(), sum: op.sum('bar') })
        ], { offset: 1 }).toObject()
      ).evaluate(dt),
      { count: [4], sum: [10] },
      'serialized query data'
    );
  });

  it('evaluates count verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([count()]).toObject()
      ).evaluate(dt),
      { count: [4] },
      'count query result'
    );

    tableEqual(
      Query.from(
        new Query([count({ as: 'cnt' })]).toObject()
      ).evaluate(dt),
      { cnt: [4] },
      'count query result, with options'
    );
  });

  it('evaluates dedupe verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([dedupe([])]).toObject()
      ).evaluate(dt),
      { foo: [0, 1, 2, 3], bar: [1, 1, 0, 0] },
      'dedupe query result'
    );

    tableEqual(
      Query.from(
        new Query([dedupe(['bar'])]).toObject()
      ).evaluate(dt),
      { foo: [0, 2], bar: [1, 0] },
      'dedupe query result, key'
    );

    tableEqual(
      Query.from(
        new Query([dedupe([not('foo')])]).toObject()
      ).evaluate(dt),
      { foo: [0, 2], bar: [1, 0] },
      'dedupe query result, key selection'
    );
  });

  it('evaluates derive verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    const verb = derive(
      {
        baz: d => d.foo + 1 - op.mean(d.foo),
        bop: 'd => 2 * (d.foo - op.mean(d.foo))',
        sum: rolling(d => op.sum(d.foo)),
        win: rolling(d => op.product(d.foo), [0, 1])
      },
      {
        before: 'bar'
      }
    );

    tableEqual(
      Query.from(
        new Query([verb]).toObject()
      ).evaluate(dt),
      {
        foo: [0, 1, 2, 3],
        baz: [-0.5, 0.5, 1.5, 2.5],
        bop: [-3, -1, 1, 3],
        sum: [0, 1, 3, 6],
        win: [0, 2, 6, 3],
        bar: [1, 1, 0, 0]
      },
      'derive query result'
    );
  });

  it('evaluates filter verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    const verb = filter(d => d.bar > 0);

    tableEqual(
      Query.from(
        new Query([verb]).toObject()
      ).evaluate(dt),
      {
        foo: [0, 1],
        bar: [1, 1]
      },
      'filter query result'
    );
  });

  it('evaluates groupby verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    groupbyEqual(
      Query.from(
        new Query([groupby(['bar'])]).toObject()
      ).evaluate(dt),
      dt.groupby('bar'),
      'groupby query result'
    );

    groupbyEqual(
      Query.from(
        new Query([groupby([{bar: d => d.bar}])]).toObject()
      ).evaluate(dt),
      dt.groupby('bar'),
      'groupby query result, table expression'
    );

    groupbyEqual(
      Query.from(
        new Query([groupby([not('foo')])]).toObject()
      ).evaluate(dt),
      dt.groupby('bar'),
      'groupby query result, selection'
    );
  });

  it('evaluates orderby verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([orderby(['bar', 'foo'])]).toObject()
      ).evaluate(dt),
      {
        foo: [2, 3, 0, 1],
        bar: [0, 0, 1, 1]
      },
      'orderby query result'
    );

    tableEqual(
      Query.from(
        new Query([orderby([
          d => d.bar,
          d => d.foo
        ])]).toObject()
      ).evaluate(dt),
      {
        foo: [2, 3, 0, 1],
        bar: [0, 0, 1, 1]
      },
      'orderby query result'
    );

    tableEqual(
      Query.from(
        new Query([orderby([desc('bar'), desc('foo')])]).toObject()
      ).evaluate(dt),
      {
        foo: [1, 0, 3, 2],
        bar: [1, 1, 0, 0]
      },
      'orderby query result, desc'
    );
  });

  it('evaluates reify verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    }).filter(d => d.foo < 1);

    tableEqual(
      Query.from(
        new Query([ reify() ]).toObject()
      ).evaluate(dt),
      { foo: [0], bar: [1] },
      'reify query result'
    );
  });

  it('evaluates relocate verbs', () => {
    const a = [1], b = [2], c = [3], d = [4];
    const dt = table({ a, b, c, d });

    tableEqual(
      Query.from(
        new Query([
          relocate('b', { after: 'b' })
        ]).toObject()
      ).evaluate(dt),
      { a, c, d, b },
      'relocate query result'
    );

    tableEqual(
      Query.from(
        new Query([
          relocate(not('b', 'd'), { before: range(0, 1) })
        ]).toObject()
      ).evaluate(dt),
      { a, c, b, d },
      'relocate query result'
    );
  });

  it('evaluates rename verbs', () => {
    const a = [1], b = [2], c = [3], d = [4];
    const dt = table({ a, b, c, d });

    tableEqual(
      Query.from(
        new Query([
          rename({ d: 'w', a: 'z' })
        ]).toObject()
      ).evaluate(dt),
      { z: a, b, c, w: d },
      'rename query result'
    );
  });

  it('evaluates rollup verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([rollup({
          count: op.count(),
          sum:   op.sum('foo'),
          sump1: d => 1 + op.sum(d.foo + d.bar),
          avgt2: 'd => 2 * op.mean(op.abs(d.foo))'
        })]).toObject()
      ).evaluate(dt),
      { count: [4], sum: [6], sump1: [9], avgt2: [3] },
      'rollup query result'
    );
  });

  it('evaluates sample verbs', () => {
    seed(12345);

    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([sample(2)]).toObject()
      ).evaluate(dt),
      { foo: [ 3, 1 ], bar: [ 0, 1 ] },
      'sample query result'
    );

    tableEqual(
      Query.from(
        new Query([sample(2, { replace: true })]).toObject()
      ).evaluate(dt),
      { foo: [ 3, 0 ], bar: [ 0, 1 ] },
      'sample query result, replace'
    );

    tableEqual(
      Query.from(
        new Query([sample(2, { weight: 'foo' })]).toObject()
      ).evaluate(dt),
      { foo: [ 2, 3 ], bar: [ 0, 0 ] },
      'sample query result, weight column name'
    );

    tableEqual(
      Query.from(
        new Query([sample(2, { weight: d => d.foo })]).toObject()
      ).evaluate(dt),
      { foo: [ 3, 2 ], bar: [ 0, 0 ] },
      'sample query result, weight table expression'
    );

    seed(null);
  });

  it('evaluates select verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([select(['bar'])]).toObject()
      ).evaluate(dt),
      { bar: [1, 1, 0, 0] },
      'select query result, column name'
    );

    tableEqual(
      Query.from(
        new Query([select([all()])]).toObject()
      ).evaluate(dt),
      { foo: [0, 1, 2, 3], bar: [1, 1, 0, 0] },
      'select query result, all'
    );

    tableEqual(
      Query.from(
        new Query([select([not('foo')])]).toObject()
      ).evaluate(dt),
      { bar: [1, 1, 0, 0] },
      'select query result, not'
    );

    tableEqual(
      Query.from(
        new Query([select([range(1, 1)])]).toObject()
      ).evaluate(dt),
      { bar: [1, 1, 0, 0] },
      'select query result, range'
    );
  });

  it('evaluates ungroup verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    }).groupby('bar');

    const qt = Query
      .from( new Query([ ungroup() ]).toObject() )
      .evaluate(dt);

    assert.equal(qt.isGrouped(), false, 'table is not grouped');
  });

  it('evaluates unorder verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    }).orderby('foo');

    const qt = Query
      .from( new Query([ unorder() ]).toObject() )
      .evaluate(dt);

    assert.equal(qt.isOrdered(), false, 'table is not ordered');
  });

  it('evaluates impute verbs', () => {
    const dt = table({
      x: [1, 2],
      y: [3, 4],
      z: [1, 1]
    });

    const imputed = {
      x: [1, 2, 1, 2],
      y: [3, 4, 4, 3],
      z: [1, 1, 0, 0]
    };

    const verb = impute(
      { z: () => 0 },
      { expand: ['x', 'y'] }
    );

    tableEqual(
      Query.from(
        new Query([verb]).toObject()
      ).evaluate(dt),
      imputed,
      'impute query result'
    );
  });

  it('evaluates fold verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    const folded =  {
      key: [ 'foo', 'bar', 'foo', 'bar', 'foo', 'bar', 'foo', 'bar' ],
      value: [ 0, 1, 1, 1, 2, 0, 3, 0 ]
    };

    tableEqual(
      Query.from(
        new Query([fold(['foo', 'bar'])]).toObject()
      ).evaluate(dt),
      folded,
      'fold query result, column names'
    );

    tableEqual(
      Query.from(
        new Query([fold([all()])]).toObject()
      ).evaluate(dt),
      folded,
      'fold query result, all'
    );

    tableEqual(
      Query.from(
        new Query([fold([{ foo: d => d.foo }])]).toObject()
      ).evaluate(dt),
      {
        bar: [ 1, 1, 0, 0 ],
        key: [ 'foo', 'foo', 'foo', 'foo' ],
        value: [ 0, 1, 2, 3 ]
      },
      'fold query result, table expression'
    );
  });

  it('evaluates pivot verbs', () => {
    const dt = table({
      foo: [0, 1, 2, 3],
      bar: [1, 1, 0, 0]
    });

    tableEqual(
      Query.from(
        new Query([pivot(['bar'], ['foo'])]).toObject()
      ).evaluate(dt),
      { '0': [2], '1': [0] },
      'pivot query result, column names'
    );

    tableEqual(
      Query.from(
        new Query([pivot(
          [{ bar: d => d.bar }],
          [{ foo: op.sum('foo') }]
        )]).toObject()
      ).evaluate(dt),
      { '0': [5], '1': [1] },
      'pivot query result, table expressions'
    );
  });

  it('evaluates spread verbs', () => {
    const dt = table({
      list: [[1, 2, 3]]
    });

    tableEqual(
      Query.from(
        new Query([spread(['list'])]).toObject()
      ).evaluate(dt),
      {
        'list_1': [1],
        'list_2': [2],
        'list_3': [3]
      },
      'spread query result, column names'
    );

    tableEqual(
      Query.from(
        new Query([spread(['list'], { drop: false })]).toObject()
      ).evaluate(dt),
      {
        'list': [[1, 2, 3]],
        'list_1': [1],
        'list_2': [2],
        'list_3': [3]
      },
      'spread query result, column names'
    );

    tableEqual(
      Query.from(
        new Query([spread([{ list: d => d.list }])]).toObject()
      ).evaluate(dt),
      {
        // 'list': [[1, 2, 3]],
        'list_1': [1],
        'list_2': [2],
        'list_3': [3]
      },
      'spread query result, table expression'
    );

    tableEqual(
      Query.from(
        new Query([spread(['list'], { limit: 2 })]).toObject()
      ).evaluate(dt),
      {
        // 'list': [[1, 2, 3]],
        'list_1': [1],
        'list_2': [2]
      },
      'spread query result, limit'
    );
  });

  it('evaluates unroll verbs', () => {
    const dt = table({
      list: [[1, 2, 3]]
    });

    tableEqual(
      Query.from(
        new Query([unroll(['list'])]).toObject()
      ).evaluate(dt),
      { 'list': [1, 2, 3] },
      'unroll query result, column names'
    );

    tableEqual(
      Query.from(
        new Query([unroll([{ list: d => d.list }])]).toObject()
      ).evaluate(dt),
      { 'list': [1, 2, 3] },
      'unroll query result, table expression'
    );

    tableEqual(
      Query.from(
        new Query([unroll(['list'], { limit: 2 })]).toObject()
      ).evaluate(dt),
      { 'list': [1, 2] },
      'unroll query result, limit'
    );
  });

  it('evaluates cross verbs', () => {
    const lt = table({
      x: ['A', 'B'],
      y: [1, 2]
    });

    const rt = table({
      u: ['C'],
      v: [3]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([
          cross('other')
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], u: ['C', 'C'], v: [3, 3] },
      'cross query result'
    );

    tableEqual(
      Query.from(
        new Query([
          cross('other', ['y', 'v'])
        ]).toObject()
      ).evaluate(lt, catalog),
      { y: [1, 2], v: [3, 3] },
      'cross query result, column name values'
    );

    tableEqual(
      Query.from(
        new Query([
          cross('other', [
            { y: d => d.y },
            { v: d => d.v }
          ])
        ]).toObject()
      ).evaluate(lt, catalog),
      { y: [1, 2], v: [3, 3] },
      'cross query result, table expression values'
    );

    tableEqual(
      Query.from(
        new Query([
          cross('other', {
            y: a => a.y,
            v: (a, b) => b.v
          })
        ]).toObject()
      ).evaluate(lt, catalog),
      { y: [1, 2], v: [3, 3] },
      'cross query result, two-table expression values'
    );
  });

  it('evaluates join verbs', () => {
    const lt = table({
      x: ['A', 'B', 'C'],
      y: [1, 2, 3]
    });

    const rt = table({
      u: ['A', 'B', 'D'],
      v: [4, 5, 6]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([
          join('other', ['x', 'u'])
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], u: ['A', 'B'], v: [4, 5] },
      'join query result, column name keys'
    );

    tableEqual(
      Query.from(
        new Query([
          join('other', (a, b) => op.equal(a.x, b.u))
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], u: ['A', 'B'], v: [4, 5] },
      'join query result, predicate expression'
    );

    tableEqual(
      Query.from(
        new Query([
          join('other', ['x', 'u'], [['x', 'y'], 'v'])
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], v: [4, 5] },
      'join query result, column name values'
    );

    tableEqual(
      Query.from(
        new Query([
          join('other', ['x', 'u'], [all(), not('u')])
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], v: [4, 5] },
      'join query result, selection values'
    );

    tableEqual(
      Query.from(
        new Query([
          join('other', ['x', 'u'], [
            { x: d => d.x, y: d => d.y },
            { v: d => d.v }
          ])
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], v: [4, 5] },
      'join query result, table expression values'
    );

    tableEqual(
      Query.from(
        new Query([
          join('other', ['x', 'u'], {
            x: a => a.x,
            y: a => a.y,
            v: (a, b) => b.v
          })
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2], v: [4, 5] },
      'join query result, two-table expression values'
    );

    tableEqual(
      Query.from(
        new Query([
          join('other', ['x', 'u'], [['x', 'y'], ['u', 'v']],
            { left: true, right: true})
        ]).toObject()
      ).evaluate(lt, catalog),
      {
        x: [ 'A', 'B', 'C', undefined ],
        y: [ 1, 2, 3, undefined ],
        u: [ 'A', 'B', undefined, 'D' ],
        v: [ 4, 5, undefined, 6 ]
      },
      'join query result, full join'
    );
  });

  it('evaluates semijoin verbs', () => {
    const lt = table({
      x: ['A', 'B', 'C'],
      y: [1, 2, 3]
    });

    const rt = table({
      u: ['A', 'B', 'D'],
      v: [4, 5, 6]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([
          semijoin('other', ['x', 'u'])
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2] },
      'semijoin query result, column name keys'
    );

    tableEqual(
      Query.from(
        new Query([
          semijoin('other', (a, b) => op.equal(a.x, b.u))
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B'], y: [1, 2] },
      'semijoin query result, predicate expression'
    );
  });

  it('evaluates antijoin verbs', () => {
    const lt = table({
      x: ['A', 'B', 'C'],
      y: [1, 2, 3]
    });

    const rt = table({
      u: ['A', 'B', 'D'],
      v: [4, 5, 6]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([
          antijoin('other', ['x', 'u'])
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['C'], y: [3] },
      'antijoin query result, column name keys'
    );

    tableEqual(
      Query.from(
        new Query([
          antijoin('other', (a, b) => op.equal(a.x, b.u))
        ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['C'], y: [3] },
      'antijoin query result, predicate expression'
    );
  });

  it('evaluates concat verbs', () => {
    const lt = table({
      x: ['A', 'B'],
      y: [1, 2]
    });

    const rt = table({
      x: ['B', 'C'],
      y: [2, 3]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([ concat(['other']) ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B', 'B', 'C'], y: [1, 2, 2, 3] },
      'concat query result'
    );
  });

  it('evaluates concat verbs with subqueries', () => {
    const lt = table({
      x: ['A', 'B'],
      y: [1, 2]
    });

    const rt = table({
      a: ['B', 'C'],
      b: [2, 3]
    });

    const catalog = name => name === 'other' ? rt : null;

    const sub = query('other')
      .select({ a: 'x', b: 'y' });

    tableEqual(
      Query.from(
        new Query([ concat([sub]) ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B', 'B', 'C'], y: [1, 2, 2, 3] },
      'concat query result'
    );
  });

  it('evaluates union verbs', () => {
    const lt = table({
      x: ['A', 'B'],
      y: [1, 2]
    });

    const rt = table({
      x: ['B', 'C'],
      y: [2, 3]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([ union(['other']) ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A', 'B', 'C'], y: [1, 2, 3] },
      'union query result'
    );
  });

  it('evaluates except verbs', () => {
    const lt = table({
      x: ['A', 'B'],
      y: [1, 2]
    });

    const rt = table({
      x: ['B', 'C'],
      y: [2, 3]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([ except(['other']) ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['A'], y: [1] },
      'except query result'
    );
  });

  it('evaluates intersect verbs', () => {
    const lt = table({
      x: ['A', 'B'],
      y: [1, 2]
    });

    const rt = table({
      x: ['B', 'C'],
      y: [2, 3]
    });

    const catalog = name => name === 'other' ? rt : null;

    tableEqual(
      Query.from(
        new Query([ intersect(['other']) ]).toObject()
      ).evaluate(lt, catalog),
      { x: ['B'], y: [2] },
      'intersect query result'
    );
  });
});

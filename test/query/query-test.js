import tape from 'tape';
import groupbyEqual from '../groupby-equal';
import tableEqual from '../table-equal';
import Query, { query } from '../../src/query/query';
import { Verbs } from '../../src/query/verb';
import isFunction from '../../src/util/is-function';
import { all, desc, not, op, range, rolling, seed, table } from '../../src';
import { field, func } from './util';

const {
  count, dedupe, derive, filter, groupby, orderby,
  reify, rollup, select, sample, ungroup, unorder,
  relocate, impute, fold, pivot, spread, unroll,
  cross, join, semijoin, antijoin,
  concat, union, except, intersect
} = Verbs;

tape('Query builds single-table queries', t => {
  const q = query()
    .derive({ bar: d => d.foo + 1 })
    .rollup({ count: op.count(), sum: op.sum('bar') })
    .orderby('foo', desc('bar'), d => d.baz, desc(d => d.bop))
    .groupby('foo', { baz: d => d.baz, bop: d => d.bop });

  t.deepEqual(q.toObject(), {
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

  t.end();
});

tape('Query supports multi-table verbs', t => {
  const q = query()
    .concat('concat_table')
    .join('join_table');

  t.deepEqual(q.toObject(), {
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

  t.end();
});

tape('Query supports multi-table queries', t => {
  const qc = query('concat_table')
    .select(not('foo'));

  const qj = query('join_table')
    .select(not('bar'));

  const q = query()
    .concat(qc)
    .join(qj);

  t.deepEqual(q.toObject(), {
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

  t.end();
});

tape('Query supports all defined verbs', t => {
  const verbs = Object.keys(Verbs);
  const q = query();
  t.equal(
    verbs.filter(v => isFunction(q[v])).length,
    verbs.length,
    'query builder supports all verbs'
  );
  t.end();
});

tape('Query serializes to objects', t => {
  const q = new Query([
    derive({ bar: d => d.foo + 1 }),
    rollup({
      count: op.count(),
      sum: op.sum('bar')
    }),
    orderby(['foo', desc('bar'), d => d.baz, desc(d => d.bop)]),
    groupby(['foo', { baz: d => d.baz, bop: d => d.bop }])
  ]);

  t.deepEqual(q.toObject(), {
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
  t.end();
});

tape('Query evaluates unmodified inputs', t => {
  const q = new Query([
    derive({ bar: (d, $) => d.foo + $.offset }),
    rollup({ count: op.count(), sum: op.sum('bar') })
  ], { offset: 1});

  const dt = table({ foo: [0, 1, 2, 3] });
  const dr = q.evaluate(dt);

  tableEqual(t, dr, { count: [4], sum: [10] }, 'query data');
  t.end();
});

tape('Query evaluates serialized inputs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
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
    t,
    Query.from(
      new Query([
        derive({ bar: (d, $) => d.foo + $.offset }),
        rollup({ count: op.count(), sum: op.sum('bar') })
      ], { offset: 1 }).toObject()
    ).evaluate(dt),
    { count: [4], sum: [10] },
    'serialized query data'
  );

  t.end();
});

tape('Query evaluates count verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
    Query.from(
      new Query([count()]).toObject()
    ).evaluate(dt),
    { count: [4] },
    'count query result'
  );

  tableEqual(
    t,
    Query.from(
      new Query([count({ as: 'cnt' })]).toObject()
    ).evaluate(dt),
    { cnt: [4] },
    'count query result, with options'
  );

  t.end();
});

tape('Query evaluates dedupe verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
    Query.from(
      new Query([dedupe([])]).toObject()
    ).evaluate(dt),
    { foo: [0, 1, 2, 3], bar: [1, 1, 0, 0] },
    'dedupe query result'
  );

  tableEqual(
    t,
    Query.from(
      new Query([dedupe(['bar'])]).toObject()
    ).evaluate(dt),
    { foo: [0, 2], bar: [1, 0] },
    'dedupe query result, key'
  );

  tableEqual(
    t,
    Query.from(
      new Query([dedupe([not('foo')])]).toObject()
    ).evaluate(dt),
    { foo: [0, 2], bar: [1, 0] },
    'dedupe query result, key selection'
  );

  t.end();
});

tape('Query evaluates derive verbs', t => {
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
    t,
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

  t.end();
});

tape('Query evaluates filter verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  const verb = filter(d => d.bar > 0);

  tableEqual(
    t,
    Query.from(
      new Query([verb]).toObject()
    ).evaluate(dt),
    {
      foo: [0, 1],
      bar: [1, 1]
    },
    'filter query result'
  );

  t.end();
});

tape('Query evaluates groupby verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  groupbyEqual(
    t,
    Query.from(
      new Query([groupby(['bar'])]).toObject()
    ).evaluate(dt),
    dt.groupby('bar'),
    'groupby query result'
  );

  groupbyEqual(
    t,
    Query.from(
      new Query([groupby([{bar: d => d.bar}])]).toObject()
    ).evaluate(dt),
    dt.groupby('bar'),
    'groupby query result, table expression'
  );

  groupbyEqual(
    t,
    Query.from(
      new Query([groupby([not('foo')])]).toObject()
    ).evaluate(dt),
    dt.groupby('bar'),
    'groupby query result, selection'
  );

  t.end();
});

tape('Query evaluates orderby verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
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
    t,
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
    t,
    Query.from(
      new Query([orderby([desc('bar'), desc('foo')])]).toObject()
    ).evaluate(dt),
    {
      foo: [1, 0, 3, 2],
      bar: [1, 1, 0, 0]
    },
    'orderby query result, desc'
  );

  t.end();
});

tape('Query evaluates relocate verbs', t => {
  const a = [1], b = [2], c = [3], d = [4];
  const dt = table({ a, b, c, d });

  tableEqual(
    t,
    Query.from(
      new Query([
        relocate('b', { after: 'b' })
      ]).toObject()
    ).evaluate(dt),
    { a, c, d, b },
    'relocate query result'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        relocate(not('b', 'd'), { before: range(0, 1) })
      ]).toObject()
    ).evaluate(dt),
    { a, c, b, d },
    'relocate query result'
  );

  t.end();
});

tape('Query evaluates reify verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   }).filter(d => d.foo < 1);

  tableEqual(
    t,
    Query.from(
      new Query([ reify() ]).toObject()
    ).evaluate(dt),
    { foo: [0], bar: [1] },
    'reify query result'
  );

  t.end();
});

tape('Query evaluates rollup verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
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

  t.end();
});

tape('Query evaluates sample verbs', t => {
  seed(12345);

  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
    Query.from(
      new Query([sample(2)]).toObject()
    ).evaluate(dt),
    { foo: [ 3, 1 ], bar: [ 0, 1 ] },
    'sample query result'
  );

  tableEqual(
    t,
    Query.from(
      new Query([sample(2, { replace: true })]).toObject()
    ).evaluate(dt),
    { foo: [ 3, 0 ], bar: [ 0, 1 ] },
    'sample query result, replace'
  );

  tableEqual(
    t,
    Query.from(
      new Query([sample(2, { weight: 'foo' })]).toObject()
    ).evaluate(dt),
    { foo: [ 2, 3 ], bar: [ 0, 0 ] },
    'sample query result, weight column name'
  );

  tableEqual(
    t,
    Query.from(
      new Query([sample(2, { weight: d => d.foo })]).toObject()
    ).evaluate(dt),
    { foo: [ 3, 2 ], bar: [ 0, 0 ] },
    'sample query result, weight table expression'
  );

  seed(null);
  t.end();
});

tape('Query evaluates select verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   });

  tableEqual(
    t,
    Query.from(
      new Query([select(['bar'])]).toObject()
    ).evaluate(dt),
    { bar: [1, 1, 0, 0] },
    'select query result, column name'
  );

  tableEqual(
    t,
    Query.from(
      new Query([select([all()])]).toObject()
    ).evaluate(dt),
    { foo: [0, 1, 2, 3], bar: [1, 1, 0, 0] },
    'select query result, all'
  );

  tableEqual(
    t,
    Query.from(
      new Query([select([not('foo')])]).toObject()
    ).evaluate(dt),
    { bar: [1, 1, 0, 0] },
    'select query result, not'
  );

  tableEqual(
    t,
    Query.from(
      new Query([select([range(1, 1)])]).toObject()
    ).evaluate(dt),
    { bar: [1, 1, 0, 0] },
    'select query result, range'
  );

  t.end();
});

tape('Query evaluates ungroup verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   }).groupby('bar');

  const qt = Query
    .from( new Query([ ungroup() ]).toObject() )
    .evaluate(dt);

  t.equal(qt.isGrouped(), false, 'table is not grouped');
  t.end();
});

tape('Query evaluates unorder verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
   }).orderby('foo');

  const qt = Query
    .from( new Query([ unorder() ]).toObject() )
    .evaluate(dt);

  t.equal(qt.isOrdered(), false, 'table is not ordered');
  t.end();
});

tape('Query evaluates impute verbs', t => {
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
    t,
    Query.from(
      new Query([verb]).toObject()
    ).evaluate(dt),
    imputed,
    'impute query result'
  );

  t.end();
});

tape('Query evaluates fold verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
  });

  const folded =  {
    key: [ 'foo', 'bar', 'foo', 'bar', 'foo', 'bar', 'foo', 'bar' ],
    value: [ 0, 1, 1, 1, 2, 0, 3, 0 ]
  };

  tableEqual(
    t,
    Query.from(
      new Query([fold(['foo', 'bar'])]).toObject()
    ).evaluate(dt),
    folded,
    'fold query result, column names'
  );

  tableEqual(
    t,
    Query.from(
      new Query([fold([all()])]).toObject()
    ).evaluate(dt),
    folded,
    'fold query result, all'
  );

  tableEqual(
    t,
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

  t.end();
});

tape('Query evaluates pivot verbs', t => {
  const dt = table({
    foo: [0, 1, 2, 3],
    bar: [1, 1, 0, 0]
  });

  tableEqual(
    t,
    Query.from(
      new Query([pivot(['bar'], ['foo'])]).toObject()
    ).evaluate(dt),
    { '0': [2], '1': [0] },
    'pivot query result, column names'
  );

  tableEqual(
    t,
    Query.from(
      new Query([pivot(
        [{ bar: d => d.bar }],
        [{ foo: op.sum('foo') }]
      )]).toObject()
    ).evaluate(dt),
    { '0': [5], '1': [1] },
    'pivot query result, table expressions'
  );

  t.end();
});

tape('Query evaluates spread verbs', t => {
  const dt = table({
    list: [[1, 2, 3]]
   });

  tableEqual(
    t,
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
    t,
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
    t,
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
    t,
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

  t.end();
});

tape('Query evaluates unroll verbs', t => {
  const dt = table({
    list: [[1, 2, 3]]
   });

  tableEqual(
    t,
    Query.from(
      new Query([unroll(['list'])]).toObject()
    ).evaluate(dt),
    { 'list': [1, 2, 3] },
    'unroll query result, column names'
  );

  tableEqual(
    t,
    Query.from(
      new Query([unroll([{ list: d => d.list }])]).toObject()
    ).evaluate(dt),
    { 'list': [1, 2, 3] },
    'unroll query result, table expression'
  );

  tableEqual(
    t,
    Query.from(
      new Query([unroll(['list'], { limit: 2 })]).toObject()
    ).evaluate(dt),
    { 'list': [1, 2] },
    'unroll query result, limit'
  );

  t.end();
});

tape('Query evaluates cross verbs', t => {
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
    t,
    Query.from(
      new Query([
        cross('other')
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2], u: ['C', 'C'], v: [3, 3] },
    'cross query result'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        cross('other', ['y', 'v'])
      ]).toObject()
    ).evaluate(lt, catalog),
    { y: [1, 2], v: [3, 3] },
    'cross query result, column name values'
  );

  tableEqual(
    t,
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
    t,
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

  t.end();
});

tape('Query evaluates join verbs', t => {
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
    t,
    Query.from(
      new Query([
        join('other', ['x', 'u'])
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2], u: ['A', 'B'], v: [4, 5] },
    'join query result, column name keys'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        join('other', (a, b) => op.equal(a.x, b.u))
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2], u: ['A', 'B'], v: [4, 5] },
    'join query result, predicate expression'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        join('other', ['x', 'u'], [['x', 'y'], 'v'])
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2], v: [4, 5] },
    'join query result, column name values'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        join('other', ['x', 'u'], [all(), not('u')])
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2], v: [4, 5] },
    'join query result, selection values'
  );

  tableEqual(
    t,
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
    t,
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
    t,
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

  t.end();
});

tape('Query evaluates semijoin verbs', t => {
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
    t,
    Query.from(
      new Query([
        semijoin('other', ['x', 'u'])
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2] },
    'semijoin query result, column name keys'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        semijoin('other', (a, b) => op.equal(a.x, b.u))
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B'], y: [1, 2] },
    'semijoin query result, predicate expression'
  );

  t.end();
});

tape('Query evaluates antijoin verbs', t => {
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
    t,
    Query.from(
      new Query([
        antijoin('other', ['x', 'u'])
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['C'], y: [3] },
    'antijoin query result, column name keys'
  );

  tableEqual(
    t,
    Query.from(
      new Query([
        antijoin('other', (a, b) => op.equal(a.x, b.u))
      ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['C'], y: [3] },
    'antijoin query result, predicate expression'
  );

  t.end();
});

tape('Query evaluates concat verbs', t => {
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
    t,
    Query.from(
      new Query([ concat(['other']) ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B', 'B', 'C'], y: [1, 2, 2, 3] },
    'concat query result'
  );

  t.end();
});

tape('Query evaluates concat verbs with subqueries', t => {
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
    t,
    Query.from(
      new Query([ concat([sub]) ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B', 'B', 'C'], y: [1, 2, 2, 3] },
    'concat query result'
  );

  t.end();
});

tape('Query evaluates union verbs', t => {
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
    t,
    Query.from(
      new Query([ union(['other']) ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A', 'B', 'C'], y: [1, 2, 3] },
    'union query result'
  );

  t.end();
});

tape('Query evaluates except verbs', t => {
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
    t,
    Query.from(
      new Query([ except(['other']) ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['A'], y: [1] },
    'except query result'
  );

  t.end();
});

tape('Query evaluates intersect verbs', t => {
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
    t,
    Query.from(
      new Query([ intersect(['other']) ]).toObject()
    ).evaluate(lt, catalog),
    { x: ['B'], y: [2] },
    'intersect query result'
  );

  t.end();
});
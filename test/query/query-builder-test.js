import tape from 'tape';
import { desc, not, op } from '../../src/verbs';
import { field, func } from './util';
import { query } from '../../src/query/query-builder';
import { Verbs } from '../../src/query/verb';
import isFunction from '../../src/util/is-function';

tape('query builder builds single-table queries', t => {
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

tape('query builder supports multi-table verbs', t => {
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

tape('query builder supports multi-table queries', t => {
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

tape('query builder supports all defined verbs', t => {
  const verbs = Object.keys(Verbs);
  const q = query();
  t.equal(
    verbs.filter(v => isFunction(q[v])).length,
    verbs.length,
    'query builder supports all verbs'
  );
  t.end();
});
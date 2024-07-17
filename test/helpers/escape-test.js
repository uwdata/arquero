import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { escape, op, table } from '../../src/index.js';

describe('escape', () => {
  it('derive supports escaped functions', () => {
    const dt = table({ a: [1, 2], b: [3, 4] });
    const sq = x => x * x;
    const off = 1;

    tableEqual(
      dt.derive({ z: escape(d => sq(d.a) + off) }),
      { a: [1, 2], b: [3, 4], z: [2, 5] },
      'derive data with escape'
    );

    tableEqual(
      dt.derive({ z: escape(d => d.a * -d.b + off) }),
      { a: [1, 2], b: [3, 4], z: [-2, -7] },
      'derive data with escape, two columns'
    );

    tableEqual(
      dt.params({ foo: 2 })
        .derive({ z: escape((d, $) => sq(d.a) + off + op.abs($.foo)) }),
      { a: [1, 2], b: [3, 4], z: [4, 7] },
      'derive data with escape, op, and params'
    );

    tableEqual(
      dt.derive({ z: escape(2) }),
      { a: [1, 2], b: [3, 4], z: [2, 2] },
      'derive data with escaped literal value'
    );
  });

  it('filter supports escaped functions', () => {
    const thresh = 5;
    tableEqual(
      table({ a: [1, 4, 9], b: [1, 2, 3] }).filter(escape(d => d.a < thresh)),
      { a: [1, 4], b: [1, 2] },
      'filter data with escape'
    );
  });

  it('spread supports escaped functions', () => {
    const pair = d => [d.v, d.v * d.v + 1];

    tableEqual(
      table({ v: [3, 2, 1] }).spread({ v: escape(pair) }, { as: ['a', 'b'] }),
      { a: [3, 2, 1], b: [10, 5, 2] },
      'spread data with escape'
    );
  });

  it('groupby supports escaped functions', () => {
    tableEqual(
      table({ v: [3, 2, 1] }).groupby({ g: escape(d => -d.v) }).count(),
      { g: [-3, -2, -1], count: [1, 1, 1] },
      'groupby data with escape'
    );
  });

  it('orderby supports escaped functions', () => {
    tableEqual(
      table({ v: [1, 2, 3] }).orderby(escape(d => -d.v)),
      { v: [3, 2, 1] },
      'orderby data with escape'
    );
  });

  it('aggregate verbs throw for escaped functions', () => {
    assert.throws(
      () => table({ v: [1, 2, 3] }).rollup({ v: escape(d => -d.v) }),
      'rollup throws on escaped function'
    );

    assert.throws(
      () => table({ g: [1, 2], a: [3, 4] }).pivot('g', { v: escape(d => -d.a) }),
      'pivot throws on escaped function'
    );
  });
});

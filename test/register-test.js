import assert from 'node:assert';
import tableEqual from './table-equal.js';
import { aggregateFunctions, functions, windowFunctions } from '../src/op/index.js';
import { ExprObject } from '../src/query/constants.js';
import {
  addAggregateFunction,
  addFunction,
  addPackage,
  addTableMethod,
  addVerb,
  addWindowFunction
} from '../src/register.js';
import { op, query, table } from '../src/index.js';

describe('register', () => {
  it('addFunction registers new function', () => {
    const SECRET = 0xDEADBEEF;
    function secret() { return 0xDEADBEEF; }

    addFunction(secret);
    addFunction('sssh', secret);
    assert.equal(functions.secret(), SECRET, 'add implicitly named function');
    assert.equal(functions.sssh(), SECRET, 'add explicitly named function');

    assert.throws(
      () => addFunction(() => 'foo'),
      'do not accept anonymous functions'
    );

    assert.throws(
      () => addFunction('abs', val => val < 0 ? -val : val),
      'do not overwrite existing functions'
    );

    const abs = op.abs;
    assert.doesNotThrow(
      () => {
        addFunction('abs', val => val < 0 ? -val : val, { override: true });
        addFunction('abs', abs, { override: true });
      },
      'support override option'
    );
  });

  it('addAggregateFunction registers new aggregate function', () => {
    const create = () => ({
      init: s => (s.altsign = -1, s.altsum = 0),
      add: (s, v) => s.altsum += (s.altsign *= -1) * v,
      rem: () => {},
      value: s => s.altsum
    });

    addAggregateFunction('altsum', { create, param: [1, 0] });
    assert.deepEqual(
      aggregateFunctions.altsum,
      { create, param: [1, 0] },
      'register aggregate function'
    );
    assert.equal(
      table({ x: [1, 2, 3, 4, 5]}).rollup({ a: d => op.altsum(d.x) }).get('a', 0),
      3, 'evaluate aggregate function'
    );

    assert.throws(
      () => addAggregateFunction('mean', { create }),
      'do not overwrite existing function'
    );
  });

  it('addWindowFunction registers new window function', () => {
    const create = (offset) => ({
      init: () => {},
      value: (w, f) => w.value(w.index, f) - w.index + (offset || 0)
    });

    addWindowFunction('vmi', { create, param: [1, 1] });
    assert.deepEqual(
      windowFunctions.vmi,
      { create, param: [1, 1] },
      'register window function'
    );
    tableEqual(
      table({ x: [1, 2, 3, 4, 5] }).derive({ a: d => op.vmi(d.x, 1) }).select('a'),
      { a: [2, 2, 2, 2, 2] },
      'evaluate window function'
    );

    assert.throws(
      () => addWindowFunction('rank', { create }),
      'do not overwrite existing function'
    );
  });

  it('addTableMethod registers new table method',  () => {
    const dim1 = (t, ...args) => [t.numRows(), t.numCols(), ...args];
    const dim2 = (t) => [t.numRows(), t.numCols()];

    addTableMethod('dims', dim1);

    assert.deepEqual(
      table({ a: [1, 2, 3], b: [4, 5, 6] }).dims('a', 'b'),
      [3, 2, 'a', 'b'],
      'register table method'
    );

    assert.throws(
      () => addTableMethod('_foo', dim1),
      'do not allow names that start with underscore'
    );

    assert.throws(
      () => addTableMethod('toCSV', dim1, { override: true }),
      'do not override reserved names'
    );

    assert.doesNotThrow(
      () => addTableMethod('dims', dim1),
      'allow reassignment of existing value'
    );

    assert.throws(
      () => addTableMethod('dims', dim2),
      'do not override without option'
    );

    assert.doesNotThrow(
      () => addTableMethod('dims', dim2, { override: true }),
      'allow override with option'
    );

    assert.deepEqual(
      table({ a: [1, 2, 3], b: [4, 5, 6] }).dims('a', 'b'),
      [3, 2],
      'register overridden table method'
    );
  });

  it('addVerb registers a new verb',  () => {
    const rup = (t, exprs) => t.rollup(exprs);

    addVerb('rup', rup, [
      { name: 'exprs', type: ExprObject }
    ]);

    tableEqual(
      table({ a: [1, 2, 3], b: [4, 5, 6] }).rup({ sum: op.sum('a') }),
      { sum: [ 6 ] },
      'register verb with table'
    );

    assert.deepEqual(
      query().rup({ sum: op.sum('a') }).toObject(),
      {
        verbs: [
          {
            verb: 'rup',
            exprs: { sum: { expr: 'd => op.sum(d["a"])', func: true } }
          }
        ]
      },
      'register verb with query'
    );
  });

  it('addPackage registers an extension package',  () => {
    const pkg = {
      functions: {
        secret_p: () => 0xDEADBEEF
      },
      aggregateFunctions: {
        altsum_p: {
          create: () => ({
            init: s => (s.altsign = -1, s.altsum = 0),
            add: (s, v) => s.altsum += (s.altsign *= -1) * v,
            rem: () => {},
            value: s => s.altsum
          }),
          param: [1, 0]
        }
      },
      windowFunctions: {
        vmi_p: {
          create: (offset) => ({
            init: () => {},
            value: (w, f) => w.value(w.index, f) - w.index + (offset || 0)
          }),
          param: [1, 1]
        }
      },
      tableMethods: {
        dims_p: t => [t.numRows(), t.numCols()]
      },
      verbs: {
        rup_p: {
          method: (t, exprs) => t.rollup(exprs),
          params: [ { name: 'exprs', type: ExprObject } ]
        }
      }
    };

    addPackage(pkg);

    assert.equal(functions.secret_p, pkg.functions.secret_p, 'functions');
    assert.equal(aggregateFunctions.altsum_p, pkg.aggregateFunctions.altsum_p, 'aggregate functions');
    assert.equal(windowFunctions.vmi_p, pkg.windowFunctions.vmi_p, 'window functions');
    assert.equal(table().dims_p.fn, pkg.tableMethods.dims_p, 'table methods');
    assert.equal(table().rup_p.fn, pkg.verbs.rup_p.method, 'verbs');

    assert.doesNotThrow(
      () => addPackage(pkg),
      'allow reassignment of existing value'
    );

    assert.throws(
      () => addPackage({ functions: { secret_p: () => 1 } }),
      'do not override without option'
    );

    const secret_p = () => 42;
    addPackage({ functions: { secret_p } }, { override: true });
    assert.equal(
      functions.secret_p, secret_p,
      'allow override with option'
    );
  });
});

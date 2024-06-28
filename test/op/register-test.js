import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import {
  aggregateFunctions,
  functions,
  windowFunctions
} from '../../src/op/index.js';
import {
  addAggregateFunction,
  addFunction,
  addWindowFunction
} from '../../src/op/register.js';
import { op, table } from '../../src/index.js';

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
});

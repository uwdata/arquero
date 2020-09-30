import tape from 'tape';
import tableEqual from '../table-equal';
import { aggregateFunctions, functions, windowFunctions } from '../../src/op';
import { addAggregateFunction, addFunction, addWindowFunction } from '../../src/op/register';
import { op, table } from '../../src/verbs';

tape('op includes all aggregate functions', t => {
  let pass = true;
  for (const name in aggregateFunctions) {
    if (op[name] == null) {
      pass = false;
      t.fail(`missing aggregate function: ${name}`);
    }
  }
  t.ok(pass, 'has aggregate functions');
  t.end();
});

tape('op includes all window functions', t => {
  let pass = true;
  for (const name in windowFunctions) {
    if (op[name] == null) {
      pass = false;
      t.fail(`missing window function: ${name}`);
    }
  }
  t.ok(pass, 'has window functions');
  t.end();
});

tape('addFunction registers new function', t => {
  const SECRET = 0xDEADBEEF;
  function secret() { return 0xDEADBEEF; }

  addFunction(secret);
  addFunction('sssh', secret);
  t.equal(functions.secret(), SECRET, 'add implicitly named function');
  t.equal(functions.sssh(), SECRET, 'add explicitly named function');

  t.throws(
    () => addFunction(() => 'foo'),
    'do not accept anonymous functions'
  );

  t.throws(
    () => addFunction('abs', val => val < 0 ? -val : val),
    'do not overwrite existing functions'
  );

  const abs = op.abs;
  t.doesNotThrow(
    () => {
      addFunction('abs', val => val < 0 ? -val : val, { override: true });
      addFunction('abs', abs, { override: true });
    },
    'support override option'
  );

  t.end();
});

tape('addAggregateFunction registers new aggregate function', t => {
  const create = () => ({
    init: s => (s.altsign = -1, s.altsum = 0),
    add: (s, v) => s.altsum += (s.altsign *= -1) * v,
    rem: () => {},
    value: s => s.altsum
  });

  addAggregateFunction('altsum1', { create }, { numFields: 1, numParams: 0 });
  t.deepEqual(
    aggregateFunctions.altsum1,
    { create, param: [1, 0] },
    'register aggregate function with explicit params'
  );
  t.equal(
    table({ x: [1, 2, 3, 4, 5]}).rollup({ a: d => op.altsum1(d.x) }).get('a', 0),
    3, 'evaluate aggregate function with explicit params'
  );

  addAggregateFunction('altsum2', { create, param: [1, 0] });
  t.deepEqual(
    aggregateFunctions.altsum2,
    { create, param: [1, 0] },
    'register aggregate function with implicit params'
  );
  t.equal(
    table({ x: [1, 2, 3, 4, 5]}).rollup({ a: d => op.altsum2(d.x) }).get('a', 0),
    3, 'evaluate aggregate function with implicit params'
  );

  t.throws(
    () => addAggregateFunction('mean', { create }),
    'do not overwrite existing function'
  );

  t.end();
});

tape('addWindowFunction registers new window function', t => {
  const create = (offset) => ({
    init: () => {},
    value: (w, f) => w.value(w.index, f) - w.index + (offset || 0)
  });

  addWindowFunction('vmi1', { create }, { numFields: 1, numParams: 1 });
  t.deepEqual(
    windowFunctions.vmi1,
    { create, param: [1, 1] },
    'register window function with explicit params'
  );
  tableEqual(t,
    table({ x: [1, 2, 3, 4, 5] }).derive({ a: d => op.vmi1(d.x, 1) }).select('a'),
    { a: [2, 2, 2, 2, 2] },
    'evaluate window function with explicit params'
  );

  addWindowFunction('vmi2', { create, param: [1, 1] });
  t.deepEqual(
    windowFunctions.vmi2,
    { create, param: [1, 1] },
    'register window function with implicit params'
  );
  tableEqual(t,
    table({ x: [1, 2, 3, 4, 5] }).derive({ a: d => op.vmi1(d.x, 1) }).select('a'),
    { a: [2, 2, 2, 2, 2] },
    'evaluate window function with implicit params'
  );

  t.throws(
    () => addWindowFunction('rank', { create }),
    'do not overwrite existing function'
  );

  t.end();
});
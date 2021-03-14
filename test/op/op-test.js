import tape from 'tape';
import { aggregateFunctions, functions, windowFunctions } from '../../src/op';
import op from '../../src/op/op-api';
import has from '../../src/util/has';

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

tape('op functions do not have name collision', t => {
  const overlap = [];

  for (const name in aggregateFunctions) {
    if (has(functions, name) || has(windowFunctions, name)) {
      overlap.push(name);
    }
  }
  for (const name in windowFunctions) {
    if (has(functions, name)) {
      overlap.push(name);
    }
  }

  t.deepEqual(overlap, [], 'no name collisons');
  t.end();
});
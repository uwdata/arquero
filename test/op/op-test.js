import tape from 'tape';
import { aggregateFunctions, windowFunctions } from '../../src/op';
import op from '../../src/op/op-api';

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
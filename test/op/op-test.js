import assert from 'node:assert';
import { aggregateFunctions, functions, windowFunctions } from '../../src/op/index.js';
import op from '../../src/op/op-api.js';
import has from '../../src/util/has.js';

describe('op', () => {
  it('includes all aggregate functions', () => {
    let pass = true;
    for (const name in aggregateFunctions) {
      if (op[name] == null) {
        pass = false;
        assert.fail(`missing aggregate function: ${name}`);
      }
    }
    assert.ok(pass, 'has aggregate functions');
  });

  it('includes all window functions', () => {
    let pass = true;
    for (const name in windowFunctions) {
      if (op[name] == null) {
        pass = false;
        assert.fail(`missing window function: ${name}`);
      }
    }
    assert.ok(pass, 'has window functions');
  });

  it('functions do not have name collision', () => {
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

    assert.deepEqual(overlap, [], 'no name collisons');
  });
});

import tableEqual from '../table-equal.js';
import { not, table } from '../../src/index.js';

function data() {
  return {
    k: ['a', 'b', 'b'],
    x: [1, 2, 3],
    y: [9, 8, 7]
  };
}

function output(key = 'key', value = 'value') {
  return {
    k: ['a', 'a', 'b', 'b', 'b', 'b'],
    [key]: ['x', 'y', 'x', 'y', 'x', 'y'],
    [value]: [1, 9, 2, 8, 3, 7]
  };
}

describe('fold', () => {
  it('generates key-value pair columns', () => {
    const ut = table(data()).fold(['x', 'y']);
    tableEqual(ut, output(), 'fold data');
  });

  it('accepts select statements', () => {
    const ut = table(data()).fold(not('k'));
    tableEqual(ut, output(), 'fold selected data');
  });

  it('accepts named output columns', () => {
    const ut = table(data()).fold(['x', 'y'], { as: ['u', 'v'] });
    tableEqual(ut, output('u', 'v'), 'fold as data');
  });
});

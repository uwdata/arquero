import assert from 'node:assert';
import { op } from '../../src/index.js';

describe('math op', () => {
  it('greatest returns the greatest element', () => {
    assert.equal(op.greatest(1, 2, 3), 3, 'greatest');
    assert.equal(op.greatest(1, null, 3), 3, 'greatest with null');
    assert.equal(op.greatest(1, undefined, 3), NaN, 'greatest with undefined');
    assert.equal(op.greatest(1, NaN, 3), NaN, 'greatest with NaN');
  });

  it('least returns the least element', () => {
    assert.equal(op.least(1, 2, 3), 1, 'least');
    assert.equal(op.least(1, null, 3), 0, 'least with null');
    assert.equal(op.least(1, undefined, 3), NaN, 'least with undefined');
    assert.equal(op.least(1, NaN, 3), NaN, 'least with NaN');
  });
});

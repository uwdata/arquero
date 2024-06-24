import assert from 'node:assert';
import { op, table } from '../../src/index.js';

describe('row_object op', () => {
  it('row_object generates objects with row data', () => {
    const dt = table({ a: [1, 2], b: [3, 4] });

    assert.deepEqual(
      dt.derive({ row: op.row_object() }).array('row'),
      dt.objects(),
      'row objects, outside function context'
    );

    assert.deepEqual(
      dt.derive({ row: () => op.row_object() }).array('row'),
      dt.objects(),
      'row objects, inside function context'
    );

    assert.deepEqual(
      dt.derive({ row: op.row_object('a') }).array('row'),
      dt.objects({ columns: 'a' }),
      'row objects, column names outside function context'
    );

    assert.deepEqual(
      dt.derive({ row: () => op.row_object('a' + '') }).array('row'),
      dt.objects({ columns: 'a' }),
      'row objects, column names inside function context'
    );

    assert.deepEqual(
      dt.derive({ row: op.row_object(0) }).array('row'),
      dt.objects({ columns: 'a' }),
      'row objects, column indices outside function context'
    );

    assert.deepEqual(
      dt.derive({ row: () => op.row_object(0 + 0) }).array('row'),
      dt.objects({ columns: 'a' }),
      'row objects, column indices inside function context'
    );
  });
});

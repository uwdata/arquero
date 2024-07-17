import assert from 'node:assert';
import { ColumnTable, Table } from '../../src/index.js';
import * as verbs from '../../src/verbs/index.js';

describe('ColumnTable', () => {
  it('extends Table', () => {
    const dt = new ColumnTable({ x: [1, 2, 3] });
    assert.ok(dt instanceof Table, 'ColumnTable extends Table');
  });

  it('includes transformation verbs', () => {
    const proto = ColumnTable.prototype;
    assert.ok(
      typeof proto.count === 'function',
      'ColumnTable includes count verb'
    );
    for (const verbName of Object.keys(verbs)) {
      assert.ok(
        typeof proto[verbName] === 'function',
        `ColumnTable includes ${verbName} verb`
      );
    }
  });

  it('includes output format methods', () => {
    const proto = ColumnTable.prototype;
    assert.ok(
      typeof proto.toArrow === 'function',
      'ColumnTable includes toArrow'
    );
    assert.ok(
      typeof proto.toArrowIPC === 'function',
      'ColumnTable includes toArrowIPC'
    );
    assert.ok(
      typeof proto.toCSV === 'function',
      'ColumnTable includes toCSV'
    );
    assert.ok(
      typeof proto.toHTML === 'function',
      'ColumnTable includes toHTML'
    );
    assert.ok(
      typeof proto.toJSON === 'function',
      'ColumnTable includes toJSON'
    );
    assert.ok(
      typeof proto.toMarkdown === 'function',
      'ColumnTable includes toMarkdown'
    );
  });
});

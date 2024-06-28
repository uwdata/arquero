import assert from 'node:assert';
import { Utf8 } from 'apache-arrow';
import tableEqual from '../table-equal.js';
import fromArrow from '../../src/format/from-arrow.js';
import toArrow from '../../src/format/to-arrow.js';
import { not } from '../../src/helpers/selection.js';
import { table } from '../../src/index.js';
import { isFixedSizeList, isList, isStruct } from '../../src/arrow/arrow-types.js';

function arrowTable(data, types) {
  return toArrow(table(data), { types });
}

describe('fromArrow', () => {
  it('imports Apache Arrow tables', () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e']
    };
    const at = arrowTable(data);

    tableEqual(fromArrow(at), data, 'arrow data');
  });

  it('can unpack Apache Arrow tables', () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e'],
      x: ['cc', 'dd', 'cc', 'dd', 'cc'],
      y: ['aa', 'aa', null, 'bb', 'bb']
    };
    const at = arrowTable(data, { v: new Utf8() });
    const dt = fromArrow(at);

    tableEqual(dt, data, 'arrow data');
    assert.ok(dt.column('x').keyFor, 'create dictionary column without nulls');
    assert.ok(dt.column('y').keyFor, 'create dictionary column with nulls');
  });

  it('can select Apache Arrow columns', () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e'],
      x: ['cc', 'dd', 'cc', 'dd', 'cc'],
      y: ['aa', 'aa', null, 'bb', 'bb']
    };
    const at = arrowTable(data);

    const s1 = fromArrow(at, { columns: 'x' });
    assert.deepEqual(s1.columnNames(), ['x'], 'select by column name');
    tableEqual(s1, { x: data.x }, 'correct columns selected');

    const s2 = fromArrow(at, { columns: ['u', 'y'] });
    assert.deepEqual(s2.columnNames(), ['u', 'y'], 'select by column names');
    tableEqual(s2, { u: data.u, y: data.y }, 'correct columns selected');

    const s3 = fromArrow(at, { columns: not('u', 'y') });
    assert.deepEqual(s3.columnNames(), ['v', 'x'], 'select by helper');
    tableEqual(s3, { v: data.v, x: data.x }, 'correct columns selected');

    const s4 = fromArrow(at, { columns: { u: 'a', x: 'b'} });
    assert.deepEqual(s4.columnNames(), ['a', 'b'], 'select by helper');
    tableEqual(s4, { a: data.u, b: data.x }, 'correct columns selected');
  });

  it('can read Apache Arrow lists', () => {
    const l = [[1, 2, 3], null, [4, 5]];
    const at = arrowTable({ l });

    if (!isList(at.getChild('l').type)) {
      assert.fail('Arrow column should have List type');
    }
    tableEqual(fromArrow(at), { l }, 'extract Arrow list');
  });

  it('can read Apache Arrow fixed-size lists', () => {
    const l = [[1, 2], null, [4, 5]];
    const at = arrowTable({ l });

    if (!isFixedSizeList(at.getChild('l').type)) {
      assert.fail('Arrow column should have FixedSizeList type');
    }
    tableEqual(fromArrow(at), { l }, 'extract Arrow list');
  });

  it('can read Apache Arrow structs', () => {
    const s = [{ foo: 1, bar: [2, 3] }, null, { foo: 2, bar: [4] }];
    const at = arrowTable({ s });

    if (!isStruct(at.getChild('s').type)) {
      assert.fail('Arrow column should have Struct type');
    }
    tableEqual(fromArrow(at), { s }, 'extract Arrow struct');
  });

  it('can read nested Apache Arrow structs', () => {
    const s = [{ foo: 1, bar: { bop: 2 } }, { foo: 2, bar: { bop: 3 } }];
    const at = arrowTable({ s });

    if (!isStruct(at.getChild('s').type)) {
      assert.fail('Arrow column should have Struct type');
    }
    tableEqual(fromArrow(at), { s }, 'extract nested Arrow struct');
  });
});

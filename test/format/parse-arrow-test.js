import assert from 'node:assert';
import { tableFromArrays } from 'apache-arrow';
import tableEqual from '../table-equal.js';
import { parseArrow } from '../../src/format/parse-arrow.js';
import toArrow from '../../src/format/to-arrow.js';
import { not } from '../../src/helpers/selection.js';
import { table } from '../../src/index.js';
import { Type, utf8 } from '@uwdata/flechette';

function arrowTable(data) {
  return tableFromArrays(data);
}

function flechetteTable(data, types) {
  return toArrow(table(data), { types });
}

function getType(table, name) {
  const f = table.schema.fields.find(f => f.name === name);
  return f?.type;
}

describe('parseArrow', () => {
  it('imports Apache Arrow tables', async () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e']
    };
    const at = arrowTable(data);
    tableEqual(await parseArrow(at), data, 'arrow data');
  });

  it('can unpack Apache Arrow tables', async () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e'],
      x: ['cc', 'dd', 'cc', 'dd', 'cc'],
      y: ['aa', 'aa', null, 'bb', 'bb']
    };
    const at = arrowTable(data);
    const dt = await parseArrow(at);

    tableEqual(dt, data, 'arrow data');
    assert.ok(dt.column('x').keyFor, 'create dictionary column without nulls');
    assert.ok(dt.column('y').keyFor, 'create dictionary column with nulls');
  });

  it('can select Apache Arrow columns', async () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e'],
      x: ['cc', 'dd', 'cc', 'dd', 'cc'],
      y: ['aa', 'aa', null, 'bb', 'bb']
    };
    const at = arrowTable(data);

    const s1 = await parseArrow(at, { columns: 'x' });
    assert.deepEqual(s1.columnNames(), ['x'], 'select by column name');
    tableEqual(s1, { x: data.x }, 'correct columns selected');

    const s2 = await parseArrow(at, { columns: ['u', 'y'] });
    assert.deepEqual(s2.columnNames(), ['u', 'y'], 'select by column names');
    tableEqual(s2, { u: data.u, y: data.y }, 'correct columns selected');

    const s3 = await parseArrow(at, { columns: not('u', 'y') });
    assert.deepEqual(s3.columnNames(), ['v', 'x'], 'select by helper');
    tableEqual(s3, { v: data.v, x: data.x }, 'correct columns selected');

    const s4 = await parseArrow(at, { columns: { u: 'a', x: 'b'} });
    assert.deepEqual(s4.columnNames(), ['a', 'b'], 'select by helper');
    tableEqual(s4, { a: data.u, b: data.x }, 'correct columns selected');
  });

  it('imports Flechette Arrow tables', async () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e']
    };
    const at = flechetteTable(data);
    tableEqual(await parseArrow(at), data, 'arrow data');
  });

  it('can unpack Flechette Arrow tables', async () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e'],
      x: ['cc', 'dd', 'cc', 'dd', 'cc'],
      y: ['aa', 'aa', null, 'bb', 'bb']
    };
    const at = flechetteTable(data, { v: utf8() });
    const dt = await parseArrow(at);

    tableEqual(dt, data, 'arrow data');
    assert.ok(dt.column('x').keyFor, 'create dictionary column without nulls');
    assert.ok(dt.column('y').keyFor, 'create dictionary column with nulls');
  });

  it('can select Flechette Arrow columns', async () => {
    const data = {
      u: [1, 2, 3, 4, 5],
      v: ['a', 'b', null, 'd', 'e'],
      x: ['cc', 'dd', 'cc', 'dd', 'cc'],
      y: ['aa', 'aa', null, 'bb', 'bb']
    };
    const at = flechetteTable(data);

    const s1 = await parseArrow(at, { columns: 'x' });
    assert.deepEqual(s1.columnNames(), ['x'], 'select by column name');
    tableEqual(s1, { x: data.x }, 'correct columns selected');

    const s2 = await parseArrow(at, { columns: ['u', 'y'] });
    assert.deepEqual(s2.columnNames(), ['u', 'y'], 'select by column names');
    tableEqual(s2, { u: data.u, y: data.y }, 'correct columns selected');

    const s3 = await parseArrow(at, { columns: not('u', 'y') });
    assert.deepEqual(s3.columnNames(), ['v', 'x'], 'select by helper');
    tableEqual(s3, { v: data.v, x: data.x }, 'correct columns selected');

    const s4 = await parseArrow(at, { columns: { u: 'a', x: 'b'} });
    assert.deepEqual(s4.columnNames(), ['a', 'b'], 'select by helper');
    tableEqual(s4, { a: data.u, b: data.x }, 'correct columns selected');
  });

  it('can read Flechette Arrow lists', async () => {
    const l = [[1, 2, 3], null, [4, 5]];
    const at = flechetteTable({ l });

    if (getType(at, 'l').typeId !== Type.List) {
      assert.fail('Arrow column should have List type');
    }
    tableEqual(await parseArrow(at), { l }, 'extract Arrow list');
  });

  it('can read Flechette Arrow fixed-size lists', async () => {
    const l = [[1, 2], null, [4, 5]];
    const at = flechetteTable({ l });

    if (getType(at, 'l').typeId !== Type.FixedSizeList) {
      assert.fail('Arrow column should have FixedSizeList type');
    }
    tableEqual(await parseArrow(at), { l }, 'extract Arrow list');
  });

  it('can read Flechette Arrow structs', async () => {
    const s = [{ foo: 1, bar: [2, 3] }, null, { foo: 2, bar: [4] }];
    const at = flechetteTable({ s });

    if (getType(at, 's').typeId !== Type.Struct) {
      assert.fail('Arrow column should have Struct type');
    }
    tableEqual(await parseArrow(at), { s }, 'extract Arrow struct');
  });

  it('can read nested Flechette Arrow structs', async () => {
    const s = [{ foo: 1, bar: { bop: 2 } }, { foo: 2, bar: { bop: 3 } }];
    const at = flechetteTable({ s });

    if (getType(at, 's').typeId !== Type.Struct) {
      assert.fail('Arrow column should have Struct type');
    }
    tableEqual(await parseArrow(at), { s }, 'extract nested Arrow struct');
  });
});

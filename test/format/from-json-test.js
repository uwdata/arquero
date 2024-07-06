import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { fromJSON } from '../../src/index.js';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

function cols() {
  return Object.keys(data());
}

const text = '{'
  + '"str":["a","b","c"],'
  + '"int":[1,2,3],'
  + '"num":[12.3,45.6,78.9],'
  + '"bool":[true,null,false],'
  + '"date":["2010-01-01","2015-04-05","2020-02-29"]'
  + '}';

function schema(names, text) {
  return '{"schema":{"fields":'
    + JSON.stringify(names.map(name => ({ name })))
    + '},"data":' + text + '}';
}

function wrap(text) {
  return '{"data":' + text + '}';
}

describe('fromJSON', () => {
  it('parses JSON text with schema', () => {
    const table = fromJSON(schema(cols(), text));
    tableEqual(table, data(), 'json parsed data');
    assert.deepEqual(table.columnNames(), cols(), 'column names');
  });

  it('parses JSON text with parse option with schema', () => {
    const table = fromJSON(schema(cols(), text), { parse: { str: d => d + d } });
    const d = { ...data(), str: ['aa', 'bb', 'cc'] };
    tableEqual(table, d, 'json parsed data with custom parse');
    assert.deepEqual(table.columnNames(), cols(), 'column names');
  });

  it('parses JSON text without schema', () => {
    const table = fromJSON(wrap(text));
    tableEqual(table, data(), 'json parsed data');
    assert.deepEqual(table.columnNames(), cols(), 'column names');
  });

  it('parses JSON text with parse option without schema', () => {
    const table = fromJSON(wrap(text), { parse: { str: d => d + d } });
    const d = { ...data(), str: ['aa', 'bb', 'cc'] };
    tableEqual(table, d, 'json parsed data with custom parse');
    assert.deepEqual(table.columnNames(), cols(), 'column names');
  });

  it('parses JSON text as data only', () => {
    const table = fromJSON(text);
    tableEqual(table, data(), 'json parsed data');
    assert.deepEqual(table.columnNames(), cols(), 'column names');
  });

  it('parses JSON text with parse option as data only', () => {
    const table = fromJSON(text, { parse: { str: d => d + d } });
    const d = { ...data(), str: ['aa', 'bb', 'cc'] };
    tableEqual(table, d, 'json parsed data with custom parse');
    assert.deepEqual(table.columnNames(), cols(), 'column names');
  });

  it('parses ISO date strings', () => {
    const values = [
      0, '', '2.1', '2000', '2022-2023',
      new Date(Date.UTC(2000, 0, 1)),
      new Date(Date.UTC(2000, 0, 1)),
      new Date(2021, 0, 6, 12),
      new Date(2021, 0, 6, 4)
    ];
    const str = [
      0, '', '2.1', '2000', '2022-2023',
      '2000-01',
      '2000-01-01',
      '2021-01-06T12:00:00.000',
      '2021-01-06T12:00:00.000Z'
    ];
    const json = '{"v":' + JSON.stringify(str) + '}';
    const table = fromJSON(json);
    assert.deepEqual(table.column('v'), values, 'column values');
  });
});

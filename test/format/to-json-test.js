import assert from 'node:assert';
import { ColumnTable, toJSON } from '../../src/index.js';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

const colText = '{'
  + '"str":["a","b","c"],'
  + '"int":[1,2,3],'
  + '"num":[12.3,45.6,78.9],'
  + '"bool":[true,null,false],'
  + '"date":["2010-01-01","2015-04-05","2020-02-29"]'
  + '}';

const lines = [
  '{"str":"a","int":1,"num":12.3,"bool":true,"date":"2010-01-01"}',
  '{"str":"b","int":2,"num":45.6,"bool":null,"date":"2015-04-05"}',
  '{"str":"c","int":3,"num":78.9,"bool":false,"date":"2020-02-29"}'
];

const rowText = `[${lines.join(',')}]`;
const ndText = lines.join('\n');

describe('toJSON', () => {
  it('formats JSON columns', () => {
    const dt = new ColumnTable(data());
    assert.equal(toJSON(dt, { type: 'columns' }), colText, 'json column text');
    assert.equal(
      toJSON(dt, { type: 'columns', limit: 2, columns: ['str', 'int'] }),
      '{"str":["a","b"],"int":[1,2]}',
      'json column text with limit'
    );
  });

  it('formats JSON columns with format option', () => {
    const dt = new ColumnTable(data());
    assert.equal(
      toJSON(dt, {
        type: 'columns',
        limit: 2,
        columns: ['str'],
        format: { str: d => d + '!' }
      }),
      '{"str":["a!","b!"]}',
      'json column text with custom format'
    );
  });

  it('formats JSON rows', () => {
    const dt = new ColumnTable(data());
    assert.equal(toJSON(dt, { type: 'rows' }), rowText, 'json row text');
    assert.equal(
      toJSON(dt, { type: 'rows', limit: 2, columns: ['str', 'int'] }),
      '[{"str":"a","int":1},{"str":"b","int":2}]',
      'json row text with limit'
    );
  });

  it('formats JSON rows with format option', () => {
    const dt = new ColumnTable(data());
    assert.equal(
      toJSON(dt, {
        type: 'rows',
        limit: 2,
        columns: ['str'],
        format: { str: d => d + '!' }
      }),
      '[{"str":"a!"},{"str":"b!"}]',
      'json row text with custom format'
    );
  });

  it('formats newline-delimited JSON rows', () => {
    const dt = new ColumnTable(data());
    assert.equal(toJSON(dt, { type: 'ndjson' }), ndText, 'json nd text');
    assert.equal(
      toJSON(dt, { type: 'ndjson', limit: 2, columns: ['str', 'int'] }),
      '{"str":"a","int":1}\n{"str":"b","int":2}',
      'json nd text with limit'
    );
  });

  it('formats newline-delimited JSON rows with format option', () => {
    const dt = new ColumnTable(data());
    assert.equal(
      toJSON(dt, {
        type: 'ndjson',
        limit: 2,
        columns: ['str'],
        format: { str: d => d + '!' }
      }),
      '{"str":"a!"}\n{"str":"b!"}',
      'json nd text with custom format'
    );
  });
});

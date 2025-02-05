import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { fromJSON, fromJSONStream } from '../../src/index.js';
import { textStream } from './data/text-stream.js';

function cols() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

function names() {
  return ['str', 'int', 'num', 'bool', 'date'];
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

jsonTests('fromJSON', fromJSON);
jsonTests('fromJSONStream', (data, opt) => fromJSONStream(textStream(data), opt));

function jsonTests(name, parseJSON) {
  describe(name, () => {
    it('parses JSON columns from text', async () => {
      const table = await parseJSON(colText);
      tableEqual(table, cols(), 'json columns parsed data');
      assert.deepEqual(table.columnNames(), names(), 'column names');
    });

    it('parses JSON columns with selected column names', async () => {
      const table = await parseJSON(colText, { columns: ['str', 'int']});
      const { str, int } = cols();
      tableEqual(table, { str, int }, 'json columns projected');
      assert.deepEqual(table.columnNames(), ['str', 'int'], 'column names');
    });

    it('parses JSON rows from text', async () => {
      const table = await parseJSON(rowText);
      tableEqual(table, cols(), 'json rows parsed data');
      assert.deepEqual(table.columnNames(), names(), 'column names');
    });

    it('parses JSON rows with selected column names', async () => {
      const table = await parseJSON(rowText, { columns: ['str', 'int']});
      const { str, int } = cols();
      tableEqual(table, { str, int }, 'json rows projected');
      assert.deepEqual(table.columnNames(), ['str', 'int'], 'column names');
    });

    it('parses newline-delimited JSON', async () => {
      const table = await parseJSON(lines.join('\n'), { type: 'ndjson' });
      tableEqual(table, cols(), 'ndjson parsed data');
      assert.deepEqual(table.columnNames(), names(), 'column names');
    });

    it('parses newline-delimited JSON rows with selected column names', async () => {
      const table = await parseJSON(lines.join('\n'), { type: 'ndjson', columns: ['str', 'int'] });
      const { str, int } = cols();
      tableEqual(table, { str, int }, 'ndjson projected');
      assert.deepEqual(table.columnNames(), ['str', 'int'], 'column names');
    });

    it('parses JSON with custom parser', async () => {
      const table = await parseJSON(rowText, { parse: { str: d => d + d } });
      const d = { ...cols(), str: ['aa', 'bb', 'cc'] };
      tableEqual(table, d, 'json parsed data with custom parser');
      assert.deepEqual(table.columnNames(), names(), 'column names');
    });

    it('parses ISO date strings', async () => {
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
      const table = await parseJSON(json);
      assert.deepEqual(table.column('v'), values, 'column values');
    });

    // tests specific to fromJSON only
    if (parseJSON === fromJSON) {
      it('parses JSON columns from instaniated object', () => {
        const table = parseJSON(JSON.parse(colText));
        tableEqual(table, cols(), 'json columns parsed data');
        assert.deepEqual(table.columnNames(), names(), 'column names');
      });

      it('parses JSON rows from instaniated array', () => {
        const table = parseJSON(JSON.parse(rowText));
        tableEqual(table, cols(), 'json rows parsed data');
        assert.deepEqual(table.columnNames(), names(), 'column names');
      });
    }
  });
}

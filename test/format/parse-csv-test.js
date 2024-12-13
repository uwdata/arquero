import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { parseCSV } from '../../src/format/parse-csv.js';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

const text = [
  'str,int,num,bool,date',
  'a,1,12.3,true,2010-01-01',
  'b,2,45.6,,2015-04-05',
  'c,3,78.9,false,2020-02-29'
];

const tabText = text.map(t => t.split(',').join('\t'));

describe('parseCSV', () => {
  it('parses delimited text', async () => {
    const table = await parseCSV(text.join('\n'));
    assert.equal(table.numRows(), 3, 'num rows');
    assert.equal(table.numCols(), 5, 'num cols');
    tableEqual(table, data(), 'csv parsed data');
  });

  it('infers types', async () => {
    async function check(msg, values, test) {
      const d = (await parseCSV('col\n' + values.join('\n'))).array('col');
      assert.ok(d.every(v => v == null || test(v)), msg);
    }

    await check('boolean', [true, false, '', true], v => typeof v === 'boolean');
    await check('number', [1, Math.PI, '', 'NaN'], v => typeof v === 'number');
    await check('string', ['a', 1, '', 'c'], v => typeof v === 'string');
    await check('date', [
      new Date().toISOString(), '',
      new Date(2000, 0, 1).toISOString(),
      new Date(1979, 3, 14, 3, 45).toISOString()
    ], v => v instanceof Date);
    await check('date-like strings', ['2022-23', '2023-24'], v => typeof v === 'string');
  });

  it('parses delimited text with delimiter', async () => {
    const table = await parseCSV(tabText.join('\n'), { delimiter: '\t' });
    assert.equal(table.numRows(), 3, 'num rows');
    assert.equal(table.numCols(), 5, 'num cols');
    tableEqual(table, data(), 'csv parsed data with delimiter');
  });

  it('parses delimited text with header option', async () => {
    const table = await parseCSV(text.slice(1).join('\n'), { header: false });
    const cols = data();
    const d = {
      col1: cols.str,
      col2: cols.int,
      col3: cols.num,
      col4: cols.bool,
      col5: cols.date
    };
    tableEqual(table, d, 'csv parsed data with no header');
  });

  it('parses delimited text with parse option', async () => {
    const table = await parseCSV(text.join('\n'), { parse: { str: d => d + d } });
    const d = { ...data(), str: ['aa', 'bb', 'cc'] };
    tableEqual(table, d, 'csv parsed data with custom parse');
  });

  it('parses delimited text with decimal option', async () => {
    tableEqual(
      await parseCSV('a;b\nu;-1,23\nv;4,56e5\nw;', { delimiter: ';', decimal: ',' }),
      { a: ['u', 'v', 'w'], b: [-1.23, 4.56e5, null] },
      'csv parsed data with decimal option'
    );
  });

  it('parses delimited text with skip options', async () => {
    const text = '# line 1\n# line 2\na,b\n1,2\n3,4';
    const data = { a: [1, 3], b: [2, 4] };

    tableEqual(
      await parseCSV(text, { skip: 2 }), data,
      'csv parsed data with skip option'
    );

    tableEqual(
      await parseCSV(text, { comment: '#' }), data,
      'csv parsed data with comment option'
    );

    tableEqual(
      await parseCSV(text, { skip: 1, comment: '#' }), data,
      'csv parsed data with skip and comment options'
    );
  });

  it('applies parsers regardless of autoType flag', async () => {
    const text = 'a,b\r\n00152,01/01/2021\r\n30219,01/01/2021';
    const table = autoType => parseCSV(text, {
      autoType,
      parse: {
        a: v => v,
        b: v => v.split('/').reverse().join('-')
      }
    });
    const data = {
      a: ['00152', '30219'],
      b: ['2021-01-01', '2021-01-01']
    };

    tableEqual(
      await table(true), data,
      'csv parsed data with autoType true'
    );
    tableEqual(
      await table(false), data,
      'csv parsed data with autoType false'
    );
  });

  it('parses streaming data', async () => {
    /** @type {ReadableStream<string>} */
    const stream = new ReadableStream({
        start(controller) {
          controller.enqueue('skip line 1\n');
          controller.enqueue('skip line 2\n');
          controller.enqueue('a,b,c\n');
          controller.enqueue('foo,"ba');
          controller.enqueue('r",3.0');
          controller.enqueue('\nbaz,"bop"');
          controller.enqueue(',2.0\r');
          controller.enqueue('\nque,"""rocky"');
          controller.enqueue('" road",1.0');
          controller.enqueue('\n');
          controller.enqueue('# commented line\n');
          controller.enqueue('who,"goes"');
          controller.enqueue(',0.5');
          controller.close();
        },
        pull() { },
        cancel() { }
      });

    tableEqual(
      await parseCSV(stream, { skip: 2, comment: '#' }),
      {
        a: ['foo', 'baz', 'que', 'who'],
        b: ['bar', 'bop', '"rocky" road', 'goes'],
        c: [3.0, 2.0, 1.0, 0.5]
      },
      'csv parsed from custom stream'
    );
  });
});

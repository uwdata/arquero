import assert from 'node:assert';
import tableEqual from '../table-equal.js';
import { fromFixed } from '../../src/index.js';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

const names = [ 'str', 'int', 'num', 'bool', 'date' ];
const widths = [1, 1, 4, 5, 10];
const positions = [[0, 1], [1, 2], [2, 6], [6, 11], [11, 21]];
const text = [
  'a112.3true 2010-01-01',
  'b245.6     2015-04-05',
  'c378.9false2020-02-29'
];

describe('fromFixed', () => {
  it('parses fixed width files using positions', () => {
    const table = fromFixed(text.join('\n'), { names, positions });
    assert.equal(table.numRows(), 3, 'num rows');
    assert.equal(table.numCols(), 5, 'num cols');
    tableEqual(table, data(), 'fixed-width parsed data');
  });

  it('parses fixed width files using widths', () => {
    const table = fromFixed(text.join('\n'), { names, widths });
    assert.equal(table.numRows(), 3, 'num rows');
    assert.equal(table.numCols(), 5, 'num cols');
    tableEqual(table, data(), 'fixed-width parsed data');
  });

  it('infers types', () => {
    function check(msg, widths, values, test) {
      const d = fromFixed(values.join('\n'), { widths }).array('col1');
      assert.ok(d.every(v => v == null || test(v)), msg);
    }

    check('boolean', [5],
      ['true ', 'false', '     ', 'true '],
      v => typeof v === 'boolean'
    );
    check('number', [3],
      ['1  ', '3.14', '   ', 'NaN'],
      v => typeof v === 'number'
    );
    check('string', [1],
      ['a', '1', ' ', 'c'],
      v => typeof v === 'string'
    );
    check('date', [24],
      [
        new Date().toISOString(),
        '                        ',
        new Date(2000, 0, 1).toISOString(),
        new Date(1979, 3, 14, 3, 45).toISOString()
      ],
      v => v instanceof Date
    );
  });

  it('parses text with parse option', () => {
    const table = fromFixed(text.join('\n'), { names, widths, parse: { str: d => d + d } });
    const d = { ...data(), str: ['aa', 'bb', 'cc'] };
    tableEqual(table, d, 'fixed-width parsed data with custom parse');
  });

  it('parses text with decimal option', () => {
    tableEqual(
      fromFixed(
        'u -1,23\nv4,56e5\nw',
        { decimal: ',', widths: [1, 6], names: ['a', 'b'] }
      ),
      { a: ['u', 'v', 'w'], b: [-1.23, 4.56e5, null] },
      'fixed-width parsed data with decimal option'
    );
  });

  it('parses text with skip options', () => {
    const text = '# line 1\n# line 2\n12\n34';
    const data = { a: [1, 3], b: [2, 4] };
    const names = ['a', 'b'];
    const widths = [1, 1];

    tableEqual(fromFixed(text, { names, widths, skip: 2 }), data,
      'fixed-width parsed data with skip option'
    );

    tableEqual(fromFixed(text, { names, widths, comment: '#' }), data,
      'fixed-width parsed data with comment option'
    );

    tableEqual(fromFixed(text, { names, widths, skip: 1, comment: '#' }), data,
      'fixed-width parsed data with skip and comment options'
    );
  });
});

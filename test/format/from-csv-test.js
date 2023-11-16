import tape from 'tape';
import tableEqual from '../table-equal';
import fromCSV from '../../src/format/from-csv';

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

tape('fromCSV parses delimited text', t => {
  const table = fromCSV(text.join('\n'));
  t.equal(table.numRows(), 3, 'num rows');
  t.equal(table.numCols(), 5, 'num cols');
  tableEqual(t, table, data(), 'csv parsed data');
  t.end();
});

tape('fromCSV infers types', t => {
  function check(msg, values, test) {
    const d = fromCSV('col\n' + values.join('\n')).array('col');
    t.ok(d.every(v => v == null || test(v)), msg);
  }

  check('boolean', [true, false, '', true], v => typeof v === 'boolean');
  check('number', [1, Math.PI, '', 'NaN'], v => typeof v === 'number');
  check('string', ['a', 1, '', 'c'], v => typeof v === 'string');
  check('date', [
    new Date().toISOString(), '',
    new Date(2000, 0, 1).toISOString(),
    new Date(1979, 3, 14, 3, 45).toISOString()
  ], v => v instanceof Date);
  check('date-like strings', ['2022-23', '2023-24'], v => typeof v === 'string');
  t.end();
});

tape('fromCSV parses delimited text with delimiter', t => {
  const table = fromCSV(tabText.join('\n'), { delimiter: '\t' });
  t.equal(table.numRows(), 3, 'num rows');
  t.equal(table.numCols(), 5, 'num cols');
  tableEqual(t, table, data(), 'csv parsed data with delimiter');
  t.end();
});

tape('fromCSV parses delimited text with header option', t => {
  const table = fromCSV(text.slice(1).join('\n'), { header: false });
  const cols = data();
  const d = {
    col1: cols.str,
    col2: cols.int,
    col3: cols.num,
    col4: cols.bool,
    col5: cols.date
  };
  tableEqual(t, table, d, 'csv parsed data with no header');
  t.end();
});

tape('fromCSV parses delimited text with parse option', t => {
  const table = fromCSV(text.join('\n'), { parse: { str: d => d + d } });
  const d = { ...data(), str: ['aa', 'bb', 'cc'] };
  tableEqual(t, table, d, 'csv parsed data with custom parse');
  t.end();
});

tape('fromCSV parses delimited text with decimal option', t => {
  tableEqual(t,
    fromCSV('a;b\nu;-1,23\nv;4,56e5\nw;', { delimiter: ';', decimal: ',' }),
    { a: ['u', 'v', 'w'], b: [-1.23, 4.56e5, null] },
    'csv parsed data with decimal option'
  );
  t.end();
});

tape('fromCSV parses delimited text with skip options', t => {
  const text = '# line 1\n# line 2\na,b\n1,2\n3,4';
  const data = { a: [1, 3], b: [2, 4] };

  tableEqual(t, fromCSV(text, { skip: 2 }), data,
    'csv parsed data with skip option'
  );

  tableEqual(t, fromCSV(text, { comment: '#' }), data,
    'csv parsed data with comment option'
  );

  tableEqual(t, fromCSV(text, { skip: 1, comment: '#' }), data,
    'csv parsed data with skip and comment options'
  );

  t.end();
});

tape('fromCSV applies parsers regardless of autoType flag', t => {
  const text = 'a,b\r\n00152,01/01/2021\r\n30219,01/01/2021';
  const table = autoType => fromCSV(text, {
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

  tableEqual(t, table(true), data, 'csv parsed data with autoType true');
  tableEqual(t, table(false), data, 'csv parsed data with autoType false');

  t.end();
});
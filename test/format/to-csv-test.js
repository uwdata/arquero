import tape from 'tape';
import BitSet from '../../src/table/bit-set';
import ColumnTable from '../../src/table/column-table';
import toCSV from '../../src/format/to-csv';

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

tape('toCSV formats delimited text', t => {
  const dt = new ColumnTable(data());
  t.equal(toCSV(dt), text.join('\n'), 'csv text');
  t.equal(
    toCSV(dt, { limit: 2, columns: ['str', 'int'] }),
    text.slice(0, 3)
      .map(s => s.split(',').slice(0, 2).join(','))
      .join('\n'),
    'csv text with limit'
  );
  t.end();
});

tape('toCSV formats delimited text with delimiter option', t => {
  const dt = new ColumnTable(data());
  t.equal(
    toCSV(dt,  { delimiter: '\t' }),
    tabText.join('\n'),
    'csv text with delimiter'
  );
  t.equal(
    toCSV(dt, { limit: 2, delimiter: '\t', columns: ['str', 'int'] }),
    text.slice(0, 3)
      .map(s => s.split(',').slice(0, 2).join('\t'))
      .join('\n'),
    'csv text with delimiter and limit'
  );
  t.end();
});

tape('toCSV formats delimited text for filtered table', t => {
  const bs = new BitSet(3).not(); bs.clear(1);
  const dt = new ColumnTable(data(), null, bs);
  t.equal(
    toCSV(dt),
    [ ...text.slice(0, 2), ...text.slice(3) ].join('\n'),
    'csv text with limit'
  );
  t.end();
});

tape('toCSV formats delimited text with format option', t => {
  const dt = new ColumnTable(data());
  t.equal(
    toCSV(dt, { limit: 2, columns: ['str'], format: { str: d => d + '!' } }),
    ['str', 'a!', 'b!'].join('\n'),
    'csv text with custom format'
  );
  t.end();
});
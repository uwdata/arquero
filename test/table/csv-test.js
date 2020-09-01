import tape from 'tape';
import tableEqual from '../table-equal';
import ColumnTable from '../../src/table/column-table';
import { csvFormat, csvParse } from '../../src/table/csv';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

const text = 'str,int,num,bool,date\n'
  + 'a,1,12.3,true,2010-01-01\n'
  + 'b,2,45.6,,2015-04-05\n'
  + 'c,3,78.9,false,2020-02-29';

tape('csvFormat formats delimited text', t => {
  t.equal(csvFormat(new ColumnTable(data())), text, 'csv format text');
  t.end();
});

tape('csvParse parses delimited text', t => {
  const table = csvParse(text);
  t.equal(table.numRows(), 3, 'num rows');
  t.equal(table.numCols(), 5, 'num cols');
  tableEqual(t, table, data(), 'csv parse data');
  t.end();
});
import tape from 'tape';
import tableEqual from '../table-equal';
import ColumnTable from '../../src/table/column-table';
import { jsonFormat, jsonParse } from '../../src/table/json';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

const text = '{"str":["a","b","c"],"int":[1,2,3],"num":[12.3,45.6,78.9],"bool":[true,null,false],"date":["2010-01-01T00:00:00.000Z","2015-04-05T00:00:00.000Z","2020-02-29T00:00:00.000Z"]}';

tape('jsonFormat formats JSON text', t => {
  t.equal(jsonFormat(new ColumnTable(data())), text, 'json format text');
  t.end();
});

tape('jsonParse parses JSON text', t => {
  const table = jsonParse(text);
  t.equal(table.numRows(), 3, 'num rows');
  t.equal(table.numCols(), 5, 'num cols');
  tableEqual(t, table, data(), 'json parse data');
  t.end();
});


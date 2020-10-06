import tape from 'tape';
import tableEqual from '../table-equal';
import ColumnTable from '../../src/table/column-table';
import fromJSON from '../../src/format/from-json';
import toJSON from '../../src/format/to-json';

function data() {
  return {
    str: ['a', 'b', 'c'],
    int: [1, 2, 3],
    num: [12.3, 45.6, 78.9],
    bool: [true, null, false],
    date: [new Date('2010-01-01'), new Date('2015-04-05'), new Date('2020-02-29')]
  };
}

const text = '{'
  + '"str":["a","b","c"],'
  + '"int":[1,2,3],'
  + '"num":[12.3,45.6,78.9],'
  + '"bool":[true,null,false],'
  + '"date":["2010-01-01","2015-04-05","2020-02-29"]'
  + '}';

tape('toJSON formats JSON text', t => {
  const dt = new ColumnTable(data());
  t.equal(toJSON(dt), text, 'json text');
  t.equal(
    toJSON(dt, { limit: 2, columns: ['str', 'int'] }),
    '{"str":["a","b"],"int":[1,2]}',
    'json text with limit'
  );
  t.end();
});

tape('toJSON formats JSON text with format option', t => {
  const dt = new ColumnTable(data());
  t.equal(
    toJSON(dt, { limit: 2, columns: ['str'], format: { str: d => d + '!' } }),
    '{"str":["a!","b!"]}',
    'json text with custom format'
  );
  t.end();
});

tape('fromJSON parses JSON text', t => {
  const table = fromJSON(text);
  t.equal(table.numRows(), 3, 'num rows');
  t.equal(table.numCols(), 5, 'num cols');
  tableEqual(t, table, data(), 'json parsed data');
  t.end();
});

tape('fromJSON parses JSON text with parse option', t => {
  const table = fromJSON(text, { parse: { str: d => d + d } });
  const d = { ...data(), str: ['aa', 'bb', 'cc'] };
  tableEqual(t, table, d, 'json parsed data with custom parse');
  t.end();
});
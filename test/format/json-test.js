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

tape('toJSON formats JSON text with schema', t => {
  const dt = new ColumnTable(data());
  t.equal(toJSON(dt), schema(cols(), text), 'json text');
  const names = ['str', 'int'];
  t.equal(
    toJSON(dt, { limit: 2, columns: names }),
    schema(names, '{"str":["a","b"],"int":[1,2]}'),
    'json text with limit'
  );
  t.end();
});

tape('toJSON formats JSON text with format option with schema', t => {
  const dt = new ColumnTable(data());
  const names = ['str'];
  t.equal(
    toJSON(dt, { limit: 2, columns: names, format: { str: d => d + '!' } }),
    schema(names, '{"str":["a!","b!"]}'),
    'json text with custom format'
  );
  t.end();
});

tape('toJSON formats JSON text without schema', t => {
  const dt = new ColumnTable(data());
  t.equal(toJSON(dt, { schema: false }), text, 'json text');
  t.equal(
    toJSON(dt, { limit: 2, columns: ['str', 'int'], schema: false }),
    '{"str":["a","b"],"int":[1,2]}',
    'json text with limit'
  );
  t.end();
});

tape('toJSON formats JSON text with format option without schema', t => {
  const dt = new ColumnTable(data());
  t.equal(
    toJSON(dt, {
      schema: false,
      limit: 2,
      columns: ['str'],
      format: { str: d => d + '!' }
    }),
    '{"str":["a!","b!"]}',
    'json text with custom format'
  );
  t.end();
});

tape('fromJSON parses JSON text with schema', t => {
  const table = fromJSON(schema(cols(), text));
  tableEqual(t, table, data(), 'json parsed data');
  t.deepEqual(table.columnNames(), cols(), 'column names');
  t.end();
});

tape('fromJSON parses JSON text with parse option with schema', t => {
  const table = fromJSON(schema(cols(), text), { parse: { str: d => d + d } });
  const d = { ...data(), str: ['aa', 'bb', 'cc'] };
  tableEqual(t, table, d, 'json parsed data with custom parse');
  t.deepEqual(table.columnNames(), cols(), 'column names');
  t.end();
});

tape('fromJSON parses JSON text without schema', t => {
  const table = fromJSON(wrap(text));
  tableEqual(t, table, data(), 'json parsed data');
  t.deepEqual(table.columnNames(), cols(), 'column names');
  t.end();
});

tape('fromJSON parses JSON text with parse option without schema', t => {
  const table = fromJSON(wrap(text), { parse: { str: d => d + d } });
  const d = { ...data(), str: ['aa', 'bb', 'cc'] };
  tableEqual(t, table, d, 'json parsed data with custom parse');
  t.deepEqual(table.columnNames(), cols(), 'column names');
  t.end();
});

tape('fromJSON parses JSON text as data only', t => {
  const table = fromJSON(text);
  tableEqual(t, table, data(), 'json parsed data');
  t.deepEqual(table.columnNames(), cols(), 'column names');
  t.end();
});

tape('fromJSON parses JSON text with parse option as data only', t => {
  const table = fromJSON(text, { parse: { str: d => d + d } });
  const d = { ...data(), str: ['aa', 'bb', 'cc'] };
  tableEqual(t, table, d, 'json parsed data with custom parse');
  t.deepEqual(table.columnNames(), cols(), 'column names');
  t.end();
});
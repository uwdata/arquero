import tape from 'tape';
import fromArrow from '../../src/format/from-arrow';

// test stub for Arrow Column API
function arrowColumn(data, nullCount = 0) {
  return {
    length: data.length,
    get: row => data[row],
    toArray: () => data,
    [Symbol.iterator]: () => data[Symbol.iterator](),
    nullCount,
    data
  };
}

// test stub for Arrow Table API
function arrowTable(columns) {
  return {
    schema: {
      fields: Object.keys(columns).map(name => ({ name }))
    },
    getColumn: name => columns[name]
  };
}

tape('fromArrow imports Apache Arrow tables', t => {
  const u = arrowColumn([1, 2, 3, 4, 5]);
  const v = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const at = arrowTable({ u, v });
  const dt = fromArrow(at);

  t.deepEqual(dt.data(), { u, v }, 'reuse input columns');
  t.end();
});

tape('fromArrow can unpack Apache Arrow tables', t => {
  const u = arrowColumn([1, 2, 3, 4, 5]);
  const v = arrowColumn(['a', 'b', null, 'd', 'e'], 1);
  const at = arrowTable({ u, v });
  const dt = fromArrow(at, { unpack: true });

  t.notDeepEqual(dt.data(), { u, v }, 'unpack to new columns');
  t.equal(dt.column('u').data, u.data, 'reuse column data without nulls');
  t.notEqual(dt.column('v').data, u.data, 'copy column data with nulls');
  t.end();
});
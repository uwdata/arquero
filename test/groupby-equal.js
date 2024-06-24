import assert from 'node:assert';

export default function(table1, table2, msg) {
  const extract = g => ({
    keys: g.keys,
    names: g.names,
    rows: g.rows,
    size: g.size
  });

  assert.deepEqual(
    extract(table1.groups()),
    extract(table2.groups()),
    msg
  );
}

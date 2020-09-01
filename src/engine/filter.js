import BitSet from '../table/bit-set';

export default function(table, predicate) {
  const filter = new BitSet(table.totalRows());

  table.scan((row, data) => {
    if (predicate(row, data)) {
      filter.set(row);
    }
  });

  return table.create({ filter });
}
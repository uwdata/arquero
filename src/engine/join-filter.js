import BitSet from '../table/bit-set';

export default function(tableL, tableR, predicate, options = {}) {
  const filter = new BitSet(tableL.totalRows());

  // initialize data for right table
  const dataR = tableR.data();
  const idxR = tableR.indices();
  const nR = idxR.length;

  // scan tables, record matches against left table
  tableL.scan((rowL, dataL) => {
    for (let j = 0; j < nR; ++j) {
      if (predicate(rowL, dataL, idxR[j], dataR)) {
        filter.set(rowL);
        break;
      }
    }
  });

  // if anti-join, negate the filter
  if (options.anti) {
    filter.not();
  }

  return tableL.create({ filter });
}
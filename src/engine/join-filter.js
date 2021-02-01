import BitSet from '../table/bit-set';

export default function(tableL, tableR, predicate, options = {}) {
  const filter = new BitSet(tableL.totalRows());
  const nL = tableL.numRows();
  const nR = tableR.numRows();
  const dataL = tableL.data();
  const dataR = tableR.data();

  if (tableL.isFiltered() || tableR.isFiltered()) {
    // use indices as at least one table is filtered
    const idxL = tableL.indices(false);
    const idxR = tableR.indices(false);
    for (let i = 0; i < nL; ++i) {
      const rowL = idxL[i];
      for (let j = 0; j < nR; ++j) {
        if (predicate(rowL, dataL, idxR[j], dataR)) {
          filter.set(rowL);
          break;
        }
      }
    }
  } else {
    // no filters, enumerate row indices directly
    for (let i = 0; i < nL; ++i) {
      for (let j = 0; j < nR; ++j) {
        if (predicate(i, dataL, j, dataR)) {
          filter.set(i);
          break;
        }
      }
    }
  }

  // if anti-join, negate the filter
  if (options.anti) {
    filter.not().and(tableL.mask());
  }

  return tableL.create({ filter });
}
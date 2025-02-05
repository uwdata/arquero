import { rowLookup } from './join/lookup.js';
import { inferKeys, keyPredicate } from './util/join-keys.js';
import { parse } from '../expression/parse.js';
import { BitSet } from '../table/BitSet.js';
import { isArray } from '../util/is-array.js';
import { toArray } from '../util/to-array.js';

export function semijoin(tableL, tableR, on) {
  return join_filter(tableL, tableR, on, { anti: false });
}

export function antijoin(tableL, tableR, on) {
  return join_filter(tableL, tableR, on, { anti: true });
}

export function join_filter(tableL, tableR, on, options) {
  on = inferKeys(tableL, tableR, on);

  const predicate = isArray(on)
    ? keyPredicate(tableL, tableR, ...on.map(toArray))
    : parse({ on }, { join: [tableL, tableR] }).exprs[0];

  return _join_filter(tableL, tableR, predicate, options);
}

export function _join_filter(tableL, tableR, predicate, options = {}) {
  // calculate semi-join filter mask
  const filter = new BitSet(tableL.totalRows());
  const join = isArray(predicate) ? hashSemiJoin : loopSemiJoin;
  join(filter, tableL, tableR, predicate);

  // if anti-join, negate the filter
  if (options.anti) {
    filter.not().and(tableL.mask());
  }

  return tableL.create({ filter });
}

function hashSemiJoin(filter, tableL, tableR, [keyL, keyR]) {
  // build lookup table
  const lut = rowLookup(tableR, keyR);

  // scan table, update filter with matches
  tableL.scan((rowL, data) => {
    const rowR = lut.get(keyL(rowL, data));
    if (rowR >= 0) filter.set(rowL);
  });
}

function loopSemiJoin(filter, tableL, tableR, predicate) {
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
}

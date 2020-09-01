import concat from '../util/concat';
import unroll from '../util/unroll2';

function emitter(columns, getters) {
  const args = ['i', 'a', 'j', 'b'];
  return unroll(columns, getters, args,
    '{' + concat(columns, (_, i) => `_${i}.push($${i}(${args}));`) + '}');
}

export default function(tableL, tableR, predicate, { values }, options = {}) {
  // initialize data for left table
  const dataL = tableL.data();
  const idxL = tableL.indices();
  const nL = idxL.length;
  const hitL = new Int32Array(nL);

  // initialize data for right table
  const dataR = tableR.data();
  const idxR = tableR.indices();
  const nR = idxR.length;
  const hitR = new Int32Array(nR);

  // initialize output data
  const data = {}, columns = [], getters = [];
  for (const name in values) {
    columns.push(data[name] = []);
    getters.push(values[name]);
  }
  const emit = emitter(columns, getters);

  // perform nested-loops join
  for (let i = 0; i < nL; ++i) {
    const rowL = idxL[i];
    for (let j = 0; j < nR; ++j) {
      const rowR = idxR[j];
      if (predicate(rowL, dataL, rowR, dataR)) {
        emit(rowL, dataL, rowR, dataR);
        hitL[i] = 1;
        hitR[j] = 1;
      }
    }
  }

  if (options.left) {
    for (let i = 0; i < nL; ++i) {
      if (!hitL[i]) {
        emit(idxL[i], dataL, -1, dataR);
      }
    }
  }

  if (options.right) {
    for (let j = 0; j < nR; ++j) {
      if (!hitR[j]) {
        emit(-1, dataL, idxR[j], dataR);
      }
    }
  }

  return tableL.create({ data, groups: null, order: null });
}
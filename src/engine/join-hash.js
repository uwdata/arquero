import concat from '../util/concat';
import unroll from '../util/unroll2';

function emitter(columns, getters) {
  const args = ['i', 'a', 'j', 'b'];
  return unroll(columns, getters, args,
    '{' + concat(columns, (_, i) => `_${i}.push($${i}(${args}));`) + '}');
}

export default function(tableL, tableR, [keyL, keyR], { values }, options = {}) {
  // initialize data for left table
  const dataL = tableL.data();
  const nL = tableL.totalRows();
  const hitL = new Int32Array(nL);

  // initialize data for right table
  const dataR = tableR.data();
  const nR = tableR.totalRows();
  const hitR = new Int32Array(nR);

  // determine which table to hash
  let tableScan, keyScan, hitScan;
  let tableHash, keyHash, hitHash, dataHash;
  if (tableL.numRows() >= tableR.numRows()) {
    tableScan = tableL; keyScan = keyL; hitScan = hitL;
    tableHash = tableR; keyHash = keyR; hitHash = hitR;
    dataHash = tableR.data();
  } else {
    tableScan = tableR; keyScan = keyR; hitScan = hitR;
    tableHash = tableL; keyHash = keyL; hitHash = hitL;
    dataHash = tableL.data();
  }

  // build lookup table
  const lut = new Map();
  tableHash.scan((row, data) => {
    const key = keyHash(row, data);
    if (key != null && key === key) {
      if (!lut.has(key)) lut.set(key, []);
      lut.get(key).push(row);
    }
  });

  // initialize output data
  const data = {}, columns = [], getters = [];
  for (const name in values) {
    columns.push(data[name] = []);
    getters.push(values[name]);
  }
  const emit = emitter(columns, getters);
  const emitScan = tableScan === tableL ? emit
    : (i, a, j, b) => emit(j, b, i, a);

  // scan other table
  tableScan.scan((rowScan, dataScan) => {
    const list = lut.get(keyScan(rowScan, dataScan));
    if (list) {
      const n = list.length;
      for (let i = 0; i < n; ++i) {
        const rowHash = list[i];
        emitScan(rowScan, dataScan, rowHash, dataHash);
        hitHash[rowHash] = 1;
      }
      hitScan[rowScan] = 1;
    }
  });

  if (options.left) {
    for (let i = 0; i < nL; ++i) {
      if (!hitL[i]) {
        emit(i, dataL, -1, dataR);
      }
    }
  }

  if (options.right) {
    for (let j = 0; j < nR; ++j) {
      if (!hitR[j]) {
        emit(-1, dataL, j, dataR);
      }
    }
  }

  return tableL.create({ data, groups: null, order: null });
}
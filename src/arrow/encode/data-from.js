import builder from '../builder/index.js';
import { arrowData, ceil64Bytes } from '../builder/util.js';

export function dataFromArray(array, type) {
  const length = array.length;
  const size = ceil64Bytes(length, array.BYTES_PER_ELEMENT);

  let data = array;
  if (length !== size) {
    data = new array.constructor(size);
    data.set(array);
  }

  return arrowData({ type, length, buffers: [null, data] });
}

export function dataFromScan(nrows, scan, column, type, nullable = true) {
  const b = builder(type, nrows, nullable);
  scan(column, b.set);
  return arrowData(b.data());
}

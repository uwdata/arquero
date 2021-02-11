import { array, ceil64Bytes, writeUtf8 } from './util';

export default function(type, length, strlen) {
  const offset = array(Int32Array, length + 1);
  const buf = array(Uint8Array, 3 * strlen);

  let idx = 0;

  return {
    set(value, index) {
      idx += writeUtf8(buf, idx, value);
      offset[index + 1] = idx;
    },
    data: () => {
      // slice utf buffer if over-allocated
      const dlen = ceil64Bytes(idx);
      const data = buf.length > dlen ? buf.subarray(0, dlen) : buf;
      return { type, length, buffers: [offset, data] };
    }
  };
}
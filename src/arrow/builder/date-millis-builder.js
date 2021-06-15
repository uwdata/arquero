import { array } from './util';

export default function(type, length) {
  const data = array(type.ArrayType, length << 1);
  return {
    set(value, index) {
      const i = index << 1;
      data[  i] = (value % 4294967296) | 0;
      data[i+1] = (value / 4294967296) | 0;
    },
    data: () => ({ type, length, buffers: [null, data] })
  };
}
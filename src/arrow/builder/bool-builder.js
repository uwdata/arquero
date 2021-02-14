import { array } from './util';

export default function(type, length) {
  const data = array(type.ArrayType, length / 8);
  return {
    set(value, index) {
      if (value) data[index >> 3] |= (1 << (index % 8));
    },
    data: () => ({ type, length, buffers: [null, data] })
  };
}
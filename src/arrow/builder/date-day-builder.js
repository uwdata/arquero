import { array } from './util';

export default function(type, length) {
  const data = array(type.ArrayType, length);
  return {
    set(value, index) { data[index] = (value / 86400000) | 0; },
    data: () => ({ type, length, buffers: [null, data] })
  };
}
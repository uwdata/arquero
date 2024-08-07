import { array } from './util.js';

export default function(type, length) {
  const data = array(type.ArrayType, length);
  return {
    set(value, index) { data[index] = value; },
    data: () => ({ type, length, buffers: [null, data] })
  };
}

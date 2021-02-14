import utf8Builder from './utf8-builder';
import { array, arrowVector } from './util';

export default function(type, length) {
  const values = [];
  const data = array(type.indices.ArrayType, length);
  const keys = Object.create(null);

  let next = -1;
  let strlen = 0;

  return {
    set(value, index) {
      const v = String(value);
      let k = keys[v];
      if (k === undefined) {
        strlen += v.length;
        keys[v] = k = ++next;
        values.push(v);
      }
      data[index] = k;
    },
    data: () => ({
      type,
      length,
      buffers: [null, data],
      dict: dictionary(type.dictionary, values, strlen)
    })
  };
}

function dictionary(type, values, strlen) {
  const b = utf8Builder(type, values.length, strlen);
  values.forEach(b.set);
  return arrowVector(b.data());
}
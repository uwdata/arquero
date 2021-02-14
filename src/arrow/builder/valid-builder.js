import { array } from './util';

export default function(builder, length) {
  const valid = array(Uint8Array, length / 8);
  let nulls = 0;

  return {
    set(value, index) {
      if (value == null) {
        ++nulls;
      } else {
        builder.set(value, index);
        valid[index >> 3] |= (1 << (index % 8));
      }
    },
    data: () => {
      const d = builder.data();
      if (nulls) {
        d.nulls = nulls;
        d.buffers[2] = valid;
      }
      return d;
    }
  };
}
import Reducer from './reducer';
import toArray from '../../util/to-array';

export default function(fields, as, pattern) {
  return new CountPattern(fields, as, pattern);
}

function columnGetter(column) {
  return (row, data) => data[column].get(row);
}

export class CountPattern extends Reducer {
  constructor(fields, as, pattern) {
    super(as || ['word', 'count']);
    this._fields = toArray(fields).map(columnGetter);
    this._pattern = pattern || ' ';
  }

  init() {
    return { index: {}, words: [], count: [] };
  }

  add({ index, words, count }, row, data) {
    const pattern = this._pattern;
    this._fields.forEach(get => {
      const text = get(row, data) + '';
      for (const token of text.split(pattern)) {
        const idx = index[token];
        if (idx == null) {
          index[token] = words.length;
          words.push(token);
          count.push(1);
        } else {
          count[idx] += 1;
        }
      }
    });
  }

  rem({ index, count }, row, data) {
    const pattern = this._pattern;
    this._fields.forEach(get => {
      const text = get(row, data) + '';
      for (const token of text.split(pattern)) {
        const idx = index[token];
        count[idx] -= 1;
      }
    });
  }

  write({ words, count }, values, index) {
    const n = words.length;
    const v0 = values[this._outputs[0]];
    const v1 = values[this._outputs[1]];
    let offset = index;
    for (let i = 0; i < n; ++i) {
      if (count[i] > 0) {
        v0[offset] = words[i];
        v1[offset] = count[i];
        ++offset;
      }
    }
    return offset - index;
  }
}